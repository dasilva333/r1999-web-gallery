import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display/cubism4';

window.PIXI = PIXI;

// PIXI 7 Settings
PIXI.settings.PRECISION_FRAGMENT = 'highp';
PIXI.settings.PREFER_CREATE_IMAGE_BITMAP = false;

console.log('Renderer bundle starting (PIXI 7)...');

let app;
async function initApp() {
    try {
        app = new PIXI.Application({
            width: 5000,
            height: 5000,
            backgroundAlpha: 0,
            preserveDrawingBuffer: false,
            resolution: 1,
            hello: true
        });
        document.body.appendChild(app.view);
        console.log('PIXI 7 Application initialized.');
    } catch (err) {
        console.error('PIXI 7 Initialization failed:', err);
    }
}

initApp();

let currentModel = null;

window.renderModel = async function(modelUrl) {
    console.log('renderModel called for:', modelUrl);
    return new Promise(async (resolve, reject) => {
        try {
            if (!app) {
                console.log('Waiting for app initialization...');
                await new Promise(r => setTimeout(r, 500));
            }

            if (currentModel) {
                app.stage.removeChild(currentModel);
                currentModel.destroy();
                currentModel = null;
            }

            console.log('Loading Live2DModel (PIXI 7)...');
            
            // Intercept and fix texture order (Bloom at the end)
            const response = await fetch(modelUrl);
            const modelSettings = await response.json();
            
            if (modelSettings.FileReferences && modelSettings.FileReferences.Textures) {
                const textures = modelSettings.FileReferences.Textures;
                const bloom = textures.filter(t => t.toLowerCase().includes('_bloom'));
                const main = textures.filter(t => !t.toLowerCase().includes('_bloom'));
                
                if (bloom.length > 0) {
                    modelSettings.FileReferences.Textures = [...main, ...bloom];
                    console.log('Texture order corrected: Blooms pushed to end.');
                }
            }

            modelSettings.url = modelUrl;

            const model = await Live2DModel.from(modelSettings, {
                autoUpdate: true
            });
            console.log('Model loaded successfully.');
            
            // PIXI 7 / Live2D Beta 0.5.0 handling
            model.premultipliedAlpha = true;
            
            currentModel = model;
            app.stage.addChild(model);

            model.update(0);
            
            const bounds = model.getLocalBounds();
            console.log(`Bounds: ${bounds.width.toFixed(0)}x${bounds.height.toFixed(0)}`);
            
            // Keeping the 0.4 scale that worked for Pickles
            const targetSize = 5000 * 0.4;
            const scale = Math.min(targetSize / bounds.width, targetSize / bounds.height);
            
            model.scale.set(scale);
            console.log('Scale set to:', scale.toFixed(4));

            model.x = (5000 / 2) - (bounds.x + bounds.width / 2) * scale;
            model.y = (5000 / 2) - (bounds.y + bounds.height / 2) * scale;
            
            // PIXI 7 filter area
            model.filterArea = app.screen;

            // PIXI 7 settled render
            setTimeout(() => {
                model.update(16);
                app.renderer.render(app.stage);
                
                setTimeout(() => {
                    model.update(16);
                    app.renderer.render(app.stage);
                    console.log('Render complete.');
                    resolve();
                }, 50);
            }, 200);

        } catch (e) {
            console.error('Render process failed:', e);
            reject(e.message || e.toString());
        }
    });
};
