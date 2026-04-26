const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 3190;
const HOST = `http://127.0.0.1:${PORT}`;

// Setup Express server to serve the local files
const app = express();
app.use(express.static(__dirname));

const server = app.listen(PORT, () => {
    console.log(`[Server] Running on ${HOST}`);
});

async function runBatch() {
    const rolesDir = path.join(__dirname, 'live2d', 'roles');
    const folders = fs.readdirSync(rolesDir).filter(f => {
        return fs.statSync(path.join(rolesDir, f)).isDirectory();
    });

    console.log(`[Batch] Found ${folders.length} characters to process.`);

    console.log('[Puppeteer] Launching headless browser...');
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--enable-webgl',
            '--ignore-gpu-blocklist'
        ]
    });

    const page = await browser.newPage();
    // Use 5000x5000 viewport to match our massive PIXI canvas
    await page.setViewport({ width: 5000, height: 5000, deviceScaleFactor: 1 });

    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));

    // Navigate to our template
    await page.goto(`${HOST}/template.html`, { waitUntil: 'networkidle0' });

    // Load the bundle directly from file
    const bundlePath = path.join(__dirname, 'bundle.js');
    await page.addScriptTag({ path: bundlePath });

    const outputDir = path.join(__dirname, 'characters');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Wait for the renderer to be ready
    await page.waitForFunction(() => typeof window.renderModel === 'function', { timeout: 30000 });

    for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        
        // TEST FILTER: Wajueyishu (silhouette) and Pikelesi (crop)
        if (folder !== '306301_pikelesi' && folder !== '306402_wajueyishu') continue;

        const outputPath = path.join(outputDir, `${folder}.png`);
        console.log(`[Batch] [${i + 1}/${folders.length}] Processing ${folder}...`);

        try {
            const modelJsonName = `${folder}.model3.json`;
            const modelUrl = `${HOST}/live2d/roles/${folder}/${modelJsonName}`;

            await page.evaluate(async (url) => {
                await window.renderModel(url);
            }, modelUrl);

            const rawPath = path.join(outputDir, `${folder}_raw.png`);
            await page.screenshot({ path: rawPath, omitBackground: true });

            const sharp = require('sharp');
            await sharp(rawPath).trim().toFile(outputPath);
            fs.unlinkSync(rawPath);

            console.log(`[Batch] [${i + 1}/${folders.length}] Done: ${folder}`);
        } catch (err) {
            console.error(`[Error] Failed to render ${folder}:`, err.message);
        }
    }

    console.log('\n[Batch] ALL CHARACTERS PROCESSED! 🐙');
    await browser.close();
    server.close();
    process.exit(0);
}

runBatch().catch(err => {
    console.error('[Fatal Error]', err);
    process.exit(1);
});
