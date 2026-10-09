import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed." },
        { status: 400 }
      );
    }
    const uniqueFilename = `${crypto.randomUUID()}${ext}`;

    const folder = formData.get("folder") as string | null;

    if (folder && (folder.includes("..") || folder.startsWith("/") || folder.startsWith("\\"))) {
      return NextResponse.json(
        { success: false, message: "Invalid folder name" },
        { status: 400 }
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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("fileUrl");

    if (!fileUrl) {
      return NextResponse.json({ success: false, message: "No file URL provided" }, { status: 400 });
    }

    // Extract the filename from the URL, expecting a format like `/uploads/filename.ext` or full URL
    const urlObj = new URL(fileUrl, "http://localhost"); 
    const pathname = urlObj.pathname;
    
    if (!pathname.startsWith("/uploads/")) {
        return NextResponse.json({ success: false, message: "Invalid file path" }, { status: 400 });
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
