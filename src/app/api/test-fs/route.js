import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Test basic fs functionality
    const testDir = 'C:\\Users\\owner\\Downloads\\Video';
    
    // Check if directory exists
    const dirExists = fs.existsSync(testDir);
    
    // Try to list files if directory exists
    let files = [];
    if (dirExists) {
      files = fs.readdirSync(testDir);
    }
    
    return NextResponse.json({
      success: true,
      fsWorking: true,
      testDir,
      dirExists,
      fileCount: files.length,
      firstFewFiles: files.slice(0, 5)
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      fsWorking: false,
      error: error.message
    }, { status: 500 });
  }
}