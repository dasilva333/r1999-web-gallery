const fs = require('fs');
const path = require('path');

const charactersDir = path.join(__dirname, 'characters');
const rootManifest = path.join(__dirname, 'character_list.json');
const webManifest = path.join(__dirname, 'web_characters', 'character_list.json');

function updateManifest() {
    if (!fs.existsSync(charactersDir)) {
        console.log('[Gallery] Web characters directory not found yet.');
        return;
    }

    const files = fs.readdirSync(charactersDir)
        .filter(f => f.endsWith('.png') && !f.includes('_raw.png'));
    
    const json = JSON.stringify(files, null, 2);
    fs.writeFileSync(rootManifest, json);
    fs.writeFileSync(webManifest, json);
    console.log(`[Gallery] Manifests updated with ${files.length} characters.`);
}

// Initial update
updateManifest();

// Watch for new files
console.log('[Gallery] Watching for new renders...');
fs.watch(charactersDir, (eventType, filename) => {
    if (filename && filename.endsWith('.png') && !filename.includes('_raw.png')) {
        updateManifest();
    }
});
