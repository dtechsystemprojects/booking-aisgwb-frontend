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

    const baseUploadDir = path.join(process.cwd(), "public", "uploads");
    const uploadDir = folder ? path.join(baseUploadDir, folder) : baseUploadDir;
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

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

    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true, message: "File deleted successfully" });
    } else {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
