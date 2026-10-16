import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer;
    let ext: string;
    let folder: string | null = null;
    
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const base64Str = body.fileBase64;
      const originalName = body.fileName || "image.png";
      folder = body.folder || null;
      
      if (!base64Str) {
        return NextResponse.json(
          { success: false, message: "No base64 file data provided" },
          { status: 400, headers: corsHeaders }
        );
      }
      
      // Extract base64 data (remove data:*;base64, prefix if present)
      const base64Data = base64Str.replace(/^data:[^;]+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
      ext = path.extname(originalName).toLowerCase();
      if (!ext || ext === ".") {
        if (base64Str.includes("image/png")) ext = ".png";
        else if (base64Str.includes("image/jpeg") || base64Str.includes("image/jpg")) ext = ".jpg";
        else if (base64Str.includes("image/webp")) ext = ".webp";
        else if (base64Str.includes("icon")) ext = ".ico";
        else if (base64Str.includes("svg")) ext = ".svg";
        else ext = ".png";
      }
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      folder = formData.get("folder") as string | null;

      if (!file) {
        return NextResponse.json(
          { success: false, message: "No file provided" },
          { status: 400, headers: corsHeaders }
        );
      }

      buffer = Buffer.from(await file.arrayBuffer());
      ext = (file.name ? path.extname(file.name) : "").toLowerCase();
      if (!ext || ext === ".") {
        if (file.type === "image/png") ext = ".png";
        else if (file.type === "image/jpeg") ext = ".jpg";
        else if (file.type === "image/webp") ext = ".webp";
        else if (file.type?.includes("icon")) ext = ".ico";
        else if (file.type?.includes("svg")) ext = ".svg";
        else ext = ".png";
      }
    }

    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".ico", ".svg", ".gif", ".avif", ".bmp"];

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only PNG, JPG, JPEG, WEBP, ICO, SVG, AVIF, and GIF are allowed." },
        { status: 400, headers: corsHeaders }
      );
    }
    const uniqueFilename = `${crypto.randomUUID()}${ext}`;

    if (folder && (folder.includes("..") || folder.startsWith("/") || folder.startsWith("\\"))) {
      return NextResponse.json(
        { success: false, message: "Invalid folder name" },
        { status: 400, headers: corsHeaders }
      );
    }

    let cwd = process.cwd();
    let isStandalone = false;
    let rootCwd = cwd;
    
    if (cwd.endsWith(".next/standalone") || cwd.endsWith(".next\\standalone")) {
      isStandalone = true;
      rootCwd = path.join(cwd, "..", "..");
    }

    // Write to active running directory (so it serves immediately)
    const activeBaseUploadDir = path.join(cwd, "public", "uploads");
    const activeUploadDir = folder ? path.join(activeBaseUploadDir, folder) : activeBaseUploadDir;
    if (!fs.existsSync(activeUploadDir)) fs.mkdirSync(activeUploadDir, { recursive: true });
    fs.writeFileSync(path.join(activeUploadDir, uniqueFilename), buffer);

    // If standalone, also write to the root project directory so files persist across rebuilds
    if (isStandalone) {
      try {
        const rootBaseUploadDir = path.join(rootCwd, "public", "uploads");
        const rootUploadDir = folder ? path.join(rootBaseUploadDir, folder) : rootBaseUploadDir;
        if (!fs.existsSync(rootUploadDir)) fs.mkdirSync(rootUploadDir, { recursive: true });
        fs.writeFileSync(path.join(rootUploadDir, uniqueFilename), buffer);
      } catch (e) {
        console.error("Failed to write to root directory (ignoring):", e);
      }
    }

    const url = folder ? `/uploads/${folder}/${uniqueFilename}` : `/uploads/${uniqueFilename}`;

    return NextResponse.json(
      { success: true, data: { url }, message: "File uploaded successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("fileUrl");

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, message: "No file URL provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Extract the filename from the URL, expecting a format like `/uploads/filename.ext` or full URL
    const urlObj = new URL(fileUrl, "http://localhost"); 
    const pathname = urlObj.pathname;
    
    if (!pathname.startsWith("/uploads/")) {
      return NextResponse.json(
        { success: false, message: "Invalid file path" },
        { status: 400, headers: corsHeaders }
      );
    }

    const filename = pathname.replace("/uploads/", "");
    // Prevent directory traversal but allow subfolders
    if (filename.includes("..") || filename.startsWith("/") || filename.startsWith("\\")) {
       return NextResponse.json({ success: false, message: "Invalid filename" }, { status: 400 });
    }

    let cwd = process.cwd();
    let isStandalone = false;
    let rootCwd = cwd;
    
    if (cwd.endsWith(".next/standalone") || cwd.endsWith(".next\\standalone")) {
      isStandalone = true;
      rootCwd = path.join(cwd, "..", "..");
    }

    const activeFilePath = path.join(cwd, "public", "uploads", filename);
    let deleted = false;
    
    if (fs.existsSync(activeFilePath)) {
      fs.unlinkSync(activeFilePath);
      deleted = true;
    }

    if (isStandalone) {
      try {
        const rootFilePath = path.join(rootCwd, "public", "uploads", filename);
        if (fs.existsSync(rootFilePath)) {
          fs.unlinkSync(rootFilePath);
          deleted = true;
        }
      } catch (e) {
        console.error("Failed to delete from root directory:", e);
      }
    }

    if (deleted) {
      return NextResponse.json({ success: true, message: "File deleted successfully" });
    } else {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
