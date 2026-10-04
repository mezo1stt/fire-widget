const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'scoreboard.sqlite');
const db = new sqlite3.Database(DB_PATH);

// =========================
// INIT FIRE TABLE
// =========================

function initFireDatabase() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS fire_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT UNIQUE NOT NULL,
                text TEXT DEFAULT 'رابط الدعم بالبايو',
                color TEXT DEFAULT '#A00000',
                shine_color TEXT DEFAULT '#FF3333',
                font_size INTEGER DEFAULT 56,
                shine_speed REAL DEFAULT 4,
                font_family TEXT DEFAULT 'Cairo',
                widget_type TEXT DEFAULT 'both',
                direction TEXT DEFAULT 'right-left',
                intro_duration REAL DEFAULT 3.0,
                outro_duration REAL DEFAULT 3.0,
                hold_duration REAL DEFAULT 2.0,
                shadow_strength INTEGER DEFAULT 30,
                neon_enabled INTEGER DEFAULT 0,
                neon_strength INTEGER DEFAULT 80,
                intro_style TEXT DEFAULT 'fade',
                outro_style TEXT DEFAULT 'fade',
                updated_at INTEGER DEFAULT (strftime('%s','now'))
            )
        `, (err) => {
            if (err) return reject(err);
            console.log('✅ Fire settings table ready');
            resolve();
        });
    });
}

// =========================
// GET SETTINGS
// =========================

function getFireSettings(uid) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM fire_settings WHERE uid = ?`,
            [uid],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

// =========================
// SAVE SETTINGS
// =========================

function saveFireSettings(uid, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const existing = await getFireSettings(uid);

            if (!existing) {
                db.run(
                    `INSERT INTO fire_settings (uid, text, color, shine_color, font_size, shine_speed, font_family, widget_type, direction, intro_duration, outro_duration, hold_duration, shadow_strength, neon_enabled, neon_strength, intro_style, outro_style) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        uid,
                        data.text || 'رابط الدعم بالبايو',
                        data.color || '#A00000',
                        data.shine_color || '#FF3333',
                        data.font_size || 56,
                        data.shine_speed || 4,
                        data.font_family || 'Cairo',
                        data.widget_type || 'both',
                        data.direction || 'right-left',
                        data.intro_duration || 3.0,
                        data.outro_duration || 3.0,
                        data.hold_duration || 2.0,
                        data.shadow_strength != null ? data.shadow_strength : 30,
                        data.neon_enabled ? 1 : 0,
                        data.neon_strength != null ? data.neon_strength : 80,
                        data.intro_style || 'fade',
                        data.outro_style || 'fade'
                    ],
                    (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    }
                );
            } else {
                db.run(
                    `UPDATE fire_settings SET text = ?, color = ?, shine_color = ?, font_size = ?, shine_speed = ?, font_family = ?, widget_type = ?, direction = ?, intro_duration = ?, outro_duration = ?, hold_duration = ?, shadow_strength = ?, neon_enabled = ?, neon_strength = ?, intro_style = ?, outro_style = ?, updated_at = strftime('%s','now') WHERE uid = ?`,
                    [
                        data.text || existing.text,
                        data.color || existing.color,
                        data.shine_color || existing.shine_color,
                        data.font_size || existing.font_size,
                        data.shine_speed || existing.shine_speed,
                        data.font_family || existing.font_family,
                        data.widget_type || existing.widget_type,
                        data.direction || existing.direction,
                        data.intro_duration || existing.intro_duration,
                        data.outro_duration || existing.outro_duration,
                        data.hold_duration || existing.hold_duration,
                        data.shadow_strength != null ? data.shadow_strength : existing.shadow_strength,
                        data.neon_enabled != null ? (data.neon_enabled ? 1 : 0) : existing.neon_enabled,
                        data.neon_strength != null ? data.neon_strength : existing.neon_strength,
                        data.intro_style || existing.intro_style,
                        data.outro_style || existing.outro_style,
                        uid
                    ],
                    (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    }
                );
            }
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    initFireDatabase,
    getFireSettings,
    saveFireSettings
};