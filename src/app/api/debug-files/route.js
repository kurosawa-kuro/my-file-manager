import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const { VIDEO_DIR } = process.env;
    const files = fs.readdirSync(VIDEO_DIR);
    
    // Look for files containing "music" or "Pale"
    const matchingFiles = files.filter(file => 
      file.toLowerCase().includes('music') || 
      file.toLowerCase().includes('pale')
    );
    
    return NextResponse.json({
      success: true,
      videoDir: VIDEO_DIR,
      totalFiles: files.length,
      matchingFiles: matchingFiles,
      searchedFor: 'music or pale'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}