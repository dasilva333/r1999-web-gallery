import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display/cubism4';

// Force high precision and disable ImageBitmap for headless stability
PIXI.settings.PRECISION_FRAGMENT = 'highp';
PIXI.settings.PREFER_CREATE_IMAGE_BITMAP = false;

console.log('Renderer bundle starting...');

let app;
try {
    app = new PIXI.Application({
        width: 5000,
        height: 5000,
        backgroundAlpha: 0,
        preserveDrawingBuffer: false,
        resolution: 1,
        autoDensity: true,
        // CRITICAL: Ensure the renderer's alpha settings are compatible with Live2D
        premultipliedAlpha: true
    });
    document.body.appendChild(app.view);
    console.log('PIXI Application initialized.');
} catch (err) {
    console.error('PIXI Initialization failed:', err);
}

let currentModel = null;

window.renderModel = async function(modelUrl) {
    console.log('renderModel called for:', modelUrl);
    return new Promise(async (resolve, reject) => {
        try {
            if (currentModel) {
                app.stage.removeChild(currentModel);
                currentModel.destroy();
                currentModel = null;
            }

            console.log('Loading Live2DModel...');
            const model = await Live2DModel.from(modelUrl);
            console.log('Model loaded successfully.');
            
            // SILHOUETTE FIX: Ensure PMA is handled correctly by the model
            model.premultipliedAlpha = true;
            
            currentModel = model;
            app.stage.addChild(model);

            model.update(0);
            
            const bounds = model.getLocalBounds();
            console.log(`Bounds: ${bounds.width.toFixed(0)}x${bounds.height.toFixed(0)}`);
            
            const targetSize = 5000 * 0.4;
            const scale = Math.min(targetSize / bounds.width, targetSize / bounds.height);
            
            model.scale.set(scale);
            console.log('Scale set to:', scale.toFixed(4));

            model.x = (5000 / 2) - (bounds.x + bounds.width / 2) * scale;
            model.y = (5000 / 2) - (bounds.y + bounds.height / 2) * scale;
            
            model.filterArea = app.screen;

            setTimeout(() => {
                // Render twice to ensure buffers are swapped and settled
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
