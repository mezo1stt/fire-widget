const express = require('express');
const path = require('path');
const fire = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// MIDDLEWARE
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =========================
// ROUTES
// =========================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'fire.html'));
});

// =========================
// DEVICE BOARD (UID تلقائي)
// =========================
app.get('/api/device-board', (req, res) => {
    const ip = req.ip || req.connection.remoteAddress || 'default';
    const board_id = 'board_' + Buffer.from(ip).toString('base64').replace(/[^a-z0-9]/gi, '').slice(0, 12);
    res.json({ success: true, board_id });
});

// =========================
// FIRE ROUTES
// =========================

app.get('/api/fire-settings/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        let settings = await fire.getFireSettings(uid);

        if (!settings) {
            await fire.saveFireSettings(uid, {});
            settings = await fire.getFireSettings(uid);
        }

        res.set('Cache-Control', 'no-store');
        res.json({ success: true, settings });
    } catch (err) {
        console.error('Fire GET error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/fire-settings/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const { 
            text, color, shine_color, font_size, shine_speed, font_family, widget_type,
            direction, intro_duration, outro_duration, hold_duration,
            shadow_strength, neon_enabled, neon_strength, intro_style, outro_style
        } = req.body;

        await fire.saveFireSettings(uid, {
            text, color, shine_color, font_size, shine_speed, font_family, widget_type,
            direction, intro_duration, outro_duration, hold_duration,
            shadow_strength, neon_enabled, neon_strength, intro_style, outro_style
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Fire POST error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// =========================
// START
// =========================

async function start() {
    try {
        await fire.initFireDatabase();
        app.listen(PORT, () => {
            console.log(`🔥 Fire Widget running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed:', err);
        process.exit(1);
    }
}

start();