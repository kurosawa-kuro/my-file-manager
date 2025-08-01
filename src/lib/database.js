import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

class Database {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'config.db');
    this.db = null;
  }

  async init() {
    // データディレクトリが存在しない場合は作成
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    // 設定テーブルを作成
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        section TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // インデックスを作成
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_settings_section ON settings(section)
    `);

    return this.db;
  }

  async getConnection() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  // 設定値を取得
  async getSetting(key) {
    const db = await this.getConnection();
    const result = await db.get('SELECT value FROM settings WHERE key = ?', [key]);
    return result ? JSON.parse(result.value) : null;
  }

  // セクション全体の設定を取得
  async getSection(section) {
    const db = await this.getConnection();
    const results = await db.all('SELECT key, value FROM settings WHERE section = ?', [section]);
    
    const sectionData = {};
    for (const row of results) {
      const key = row.key.replace(`${section}.`, '');
      sectionData[key] = JSON.parse(row.value);
    }
    
    return sectionData;
  }

  // 設定値を保存
  async setSetting(key, value, section) {
    const db = await this.getConnection();
    const valueStr = JSON.stringify(value);
    
    await db.run(
      'INSERT OR REPLACE INTO settings (key, value, section, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [key, valueStr, section]
    );
  }

  // セクション全体の設定を保存
  async setSection(section, data) {
    const db = await this.getConnection();
    
    for (const [key, value] of Object.entries(data)) {
      const fullKey = `${section}.${key}`;
      await this.setSetting(fullKey, value, section);
    }
  }

  // すべての設定を取得
  async getAllSettings() {
    const db = await this.getConnection();
    const results = await db.all('SELECT key, value, section FROM settings ORDER BY section, key');
    
    const settings = {};
    for (const row of results) {
      const key = row.key.replace(`${row.section}.`, '');
      if (!settings[row.section]) {
        settings[row.section] = {};
      }
      settings[row.section][key] = JSON.parse(row.value);
    }
    
    return settings;
  }

  // 設定を削除
  async deleteSetting(key) {
    const db = await this.getConnection();
    await db.run('DELETE FROM settings WHERE key = ?', [key]);
  }

  // セクション全体を削除
  async deleteSection(section) {
    const db = await this.getConnection();
    await db.run('DELETE FROM settings WHERE section = ?', [section]);
  }

  // データベースをリセット
  async reset() {
    const db = await this.getConnection();
    await db.run('DELETE FROM settings');
  }
}

// シングルトンインスタンス
let databaseInstance = null;

export async function getDatabase() {
  if (!databaseInstance) {
    databaseInstance = new Database();
    await databaseInstance.init();
  }
  return databaseInstance;
}

export default Database; 