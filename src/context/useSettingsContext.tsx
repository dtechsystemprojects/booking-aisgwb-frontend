"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  initialWebsiteSettings,
  WebsiteSettingItem,
} from "@/app/admin/dataStore";
import { META_DATA } from "@/config/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to extract setting value cleanly by exact or wrapped key
export const getSettingValue = (
  items: WebsiteSettingItem[],
  key: string,
  fallback: any = "",
) => {
  if (!items || items.length === 0) return fallback;
  const normalizedKey = key.trim();

  // Exact match
  const exactItem = items.find(
    (s) => s.key === normalizedKey || s.id === normalizedKey,
  );
  if (exactItem && exactItem.value !== undefined) return exactItem.value;

  // Check wrapped vs unwrapped matching (e.g., general.title vs setting('general.title'))
  const wrappedKey = normalizedKey.startsWith("setting('")
    ? normalizedKey
    : `setting('${normalizedKey}')`;
  const unwrappedKey = normalizedKey.replace(/^setting\(['"](.+)['"]\)$/, "$1");

  const match = items.find((s) => {
    const sUnwrapped = s.key.replace(/^setting\(['"](.+)['"]\)$/, "$1");
    return (
      s.key === wrappedKey ||
      sUnwrapped === unwrappedKey ||
      s.key === unwrappedKey
    );
  });

  if (match && match.value !== undefined) return match.value;
  return fallback;
};

// Global standalone setting function for anywhere across the frontend
export const setting = (key: string, fallback?: any): any => {
  let currentSettings: WebsiteSettingItem[] = initialWebsiteSettings;
  if (typeof window !== "undefined") {
    if (
      (window as any).__DYNAMIC_SETTINGS__ &&
      Array.isArray((window as any).__DYNAMIC_SETTINGS__)
    ) {
      currentSettings = (window as any).__DYNAMIC_SETTINGS__;
    } else {
      try {
        const cached = localStorage.getItem("website_settings_cache");
        if (cached) currentSettings = JSON.parse(cached);
      } catch (e) {}
    }
  }
  const defaultFallback =
    fallback !== undefined
      ? fallback
      : key.includes("title")
        ? META_DATA.title
        : "";
  return getSettingValue(currentSettings, key, defaultFallback);
};

interface SettingsContextType {
  settings: WebsiteSettingItem[];
  setting: (key: string, fallback?: any) => any;
  updateSettingsCache: (newSettings: WebsiteSettingItem[]) => void;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
  apiConnected: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: initialWebsiteSettings,
  setting: (key, fallback) => setting(key, fallback),
  updateSettingsCache: () => {},
  refreshSettings: async () => {},
  isLoading: true,
  apiConnected: false,
});

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settingsList, setSettingsList] = useState<WebsiteSettingItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("website_settings_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          (window as any).__DYNAMIC_SETTINGS__ = parsed;
          return parsed;
        }
      } catch (e) {}
    }
    if (typeof window !== "undefined") {
      (window as any).__DYNAMIC_SETTINGS__ = initialWebsiteSettings;
    }
    return initialWebsiteSettings;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  const syncDocumentMetadata = useCallback((items: WebsiteSettingItem[]) => {
    if (typeof document !== "undefined") {
      // 1. Sync Dynamic Document Title
      const siteTitle = getSettingValue(
        items,
        "setting('general.title')",
        META_DATA.title,
      );
      if (siteTitle && typeof siteTitle === "string") {
        const cleanTitle = siteTitle.trim();
        if (cleanTitle) {
          document.title = `${cleanTitle}`;
        }
      }

      // 2. Sync Dynamic Favicon (setting('general.favicon'))
      const siteFavicon = getSettingValue(
        items,
        "setting('general.favicon')",
        "",
      );
      if (siteFavicon && typeof siteFavicon === "string") {
        const cleanFavicon = siteFavicon.trim();
        if (cleanFavicon) {
          let link: HTMLLinkElement | null =
            document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = cleanFavicon;
        }
      }
    }
  }, []);

  const updateSettingsCache = useCallback(
    (newItems: WebsiteSettingItem[]) => {
      setSettingsList(newItems);
      if (typeof window !== "undefined") {
        (window as any).__DYNAMIC_SETTINGS__ = newItems;
        try {
          localStorage.setItem(
            "website_settings_cache",
            JSON.stringify(newItems),
          );
        } catch (e) {}
      }
      syncDocumentMetadata(newItems);
    },
    [syncDocumentMetadata],
  );

  const settingsListRef = useRef(settingsList);
  useEffect(() => {
    settingsListRef.current = settingsList;
  }, [settingsList]);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      let res = await fetch(`${API_URL}/admin/settings`, { headers });
      if (!res.ok) {
        res = await fetch(`${API_URL}/settings`, { headers });
      }
      if (res.ok) {
        const result = await res.json();
        const fetchedItems = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : initialWebsiteSettings;
        const cleanedItems = fetchedItems.map((s: WebsiteSettingItem) => ({
          ...s,
          key: s.key
            ? String(s.key)
                .trim()
                .replace(/^setting\(['"](.+)['"]\)$/, "$1")
            : "",
        }));
        updateSettingsCache(cleanedItems);
        setApiConnected(true);
      } else {
        throw new Error("API response was not ok");
      }
    } catch (err) {
      setApiConnected(false);
      // Keep existing settings list if API offline
      syncDocumentMetadata(settingsListRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [updateSettingsCache, syncDocumentMetadata]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    syncDocumentMetadata(settingsList);
  }, [settingsList, syncDocumentMetadata]);

  const settingHelper = useCallback(
    (key: string, fallback?: any) => {
      return getSettingValue(
        settingsList,
        key,
        fallback !== undefined
          ? fallback
          : key.includes("title")
            ? META_DATA.title
            : "",
      );
    },
    [settingsList],
  );

  const value = useMemo(
    () => ({
      settings: settingsList,
      setting: settingHelper,
      updateSettingsCache,
      refreshSettings,
      isLoading,
      apiConnected,
    }),
    [
      settingsList,
      settingHelper,
      updateSettingsCache,
      refreshSettings,
      isLoading,
      apiConnected,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => useContext(SettingsContext);
