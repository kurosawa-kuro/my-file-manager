import { NextResponse } from 'next/server';
import { getConfigManager } from '../../../lib/sqliteConfigManager.js';

// 設定を取得
export async function GET(request) {
  try {
    const configManager = await getConfigManager();
    const config = await configManager.loadConfig();
    
    return NextResponse.json({
      success: true,
      config: config
    });
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json(
      { error: '設定の取得に失敗しました。' },
      { status: 500 }
    );
  }
}

// 設定を更新
export async function POST(request) {
  try {
    const { section, key, value } = await request.json();
    
    if (!section || !key) {
      return NextResponse.json(
        { error: 'section と key は必須です。' },
        { status: 400 }
      );
    }

    const configManager = await getConfigManager();
    const path = `${section}.${key}`;
    
    await configManager.set(path, value);
    
    return NextResponse.json({
      success: true,
      message: '設定を更新しました。'
    });
  } catch (error) {
    console.error('Config POST error:', error);
    return NextResponse.json(
      { error: `設定の更新に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}

// 設定を一括更新
export async function PUT(request) {
  try {
    const { config } = await request.json();
    
    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'config オブジェクトは必須です。' },
        { status: 400 }
      );
    }

    const configManager = await getConfigManager();
    await configManager.saveConfig(config);
    
    return NextResponse.json({
      success: true,
      message: '設定を一括更新しました。'
    });
  } catch (error) {
    console.error('Config PUT error:', error);
    return NextResponse.json(
      { error: `設定の一括更新に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}

// 設定をリセット
export async function DELETE(request) {
  try {
    const configManager = await getConfigManager();
    await configManager.reset();
    
    return NextResponse.json({
      success: true,
      message: '設定をリセットしました。'
    });
  } catch (error) {
    console.error('Config DELETE error:', error);
    return NextResponse.json(
      { error: '設定のリセットに失敗しました。' },
      { status: 500 }
    );
  }
} 