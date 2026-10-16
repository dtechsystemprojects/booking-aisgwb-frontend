import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params if it's a promise (Next.js 15+)
    const resolvedParams = await params;
    const pathArray = resolvedParams.path;
    
    if (!pathArray || pathArray.length === 0) {
      return new NextResponse("Not Found", { 
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const safePath = path.join(...pathArray).replace(/^(\.\.[\/\\])+/, "");
    
    let cwd = process.cwd();
    // Resolve standalone to actual app root
    if (cwd.endsWith(".next/standalone") || cwd.endsWith(".next\\standalone")) {
      cwd = path.join(cwd, "..", "..");
    }

    let filePath = path.join(cwd, "public", "uploads", safePath);

    if (!fs.existsSync(filePath)) {
      // Check if this is an image request and provide fallback if missing
      const ext = path.extname(safePath).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        const fallbackCandidates = [
          path.join(cwd, "public", "uploads", "1692506a-9c61-4255-a1e0-d41c3e7ab514.webp"),
          path.join(cwd, "src", "assets", "images", "banner01.webp"),
        ];
        for (const candidate of fallbackCandidates) {
          if (fs.existsSync(candidate)) {
            filePath = candidate;
            break;
          }
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { 
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}
