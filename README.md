# Reverse 1999 | Live2D Character Archive 🐙

A high-fidelity, high-resolution archive of **Reverse 1999** Live2D models, rendered at 5000px resolution with perfect centering and automatic transparency trimming.

## 🔗 Live Gallery
**[View the Archive on GitHub Pages](https://dasilva333.github.io/reverse-1999-live2d-archive/)**

## 📂 Project Overview
This project uses a custom rendering pipeline to batch-process the game's Live2D assets into clean, transparent PNGs.

### Tech Stack
- **Engine**: PIXI 7 with `pixi-live2d-display` (Cubism 4 SDK)
- **Environment**: Puppeteer (Headless Chrome)
- **Processing**: Sharp (Automatic trimming of empty space)
- **Frontend**: Glassmorphic grid gallery with 3D hover effects

## 📜 Data Source
The raw Live2D assets were sourced from the **[AIRI](https://github.com/moeru-ai/airi)** repository and game data extraction projects. All assets belong to Bluepoch Co., Ltd.

## 🛠️ How it Works
1. **Express Server**: Hosts the Live2D files locally.
2. **Puppeteer**: Loads a PIXI 7 renderer in a 5000x5000 viewport.
3. **Smart Centering**: Calculates the true mesh bounds to ensure characters aren't cropped.
4. **Sharp**: Trims the resulting high-res PNGs to their minimal bounding box.

---
*Generated with 🐙 Antigravity*
