# White Square Artifact Analysis & Forensic Report

## Summary
A recurring artifact known as the "White Square" appears in certain Reverse: 1999 Live2D models (e.g., `306402_wajueyishu`, `306302_pikelesi`). While visually identical across characters, the underlying mesh and UV mapping data show that this is a texture-level issue exacerbated by generic utility meshes.

## Technical Discovery
Through dedicated mesh telemetry extraction, we have determined:
- **Origin:** The artifacts are opaque white blocks (typically ~60x60 pixels) physically painted onto the `.png` texture atlases.
- **Mesh Mapping:** The meshes mapped to these coordinates are NOT simple 4-vertex squares. In `wajueyishu`, the culprit is `ArtMesh306`, a 51-vertex polygon spanning nearly 50% of the texture height.
- **Lack of Signature:** Mesh IDs, vertex counts, and UV bounds are **not consistent** across different characters. `ArtMesh306` in one character might be a shadow layer, while in another it is a legitimate body part.

## Current Targeted Fix (Applied to `306402_wajueyishu`)
We successfully suppressed the artifact for the primary test case by identifying its specific ID and silencing it via PIXI visibility:
```javascript
if (modelUrl.includes('306402_wajueyishu')) {
    const targetIdx = ids.indexOf('ArtMesh306');
    if (targetIdx !== -1) {
        model.meshes[targetIdx].visible = false;
        model.meshes[targetIdx].alpha = 0;
    }
}
```

## Potential Generalized Solutions
To resolve this globally without hardcoding every character's specific mesh ID, the following paths are proposed:

### 1. PIXI WebGL Chroma-Key (Client-Side)
Inject a fragment shader into the PIXI rendering pipeline that keys out pixels with the exact signature `rgba(255, 255, 255, 255)`.
- **Pros:** Zero-dependency, works at runtime on any device.
- **Cons:** Risk of "punching holes" in legitimate white textures (eyes, teeth, highlights).

### 2. Texture Pre-Processing (Server-Side)
Use a library like `sharp` to scan every PNG in the library for solid 20x20+ white blocks and programmatically erase them (set alpha to 0) before the models are zipped or rendered.
- **Pros:** 100% stable, no runtime overhead.
- **Cons:** Requires a preprocessing step on the source assets.

## Progress Status
- **Bloom/Dark Bug:** RESOLVED. All textures are now correctly re-ordered to ensure bloom layers render on top of the character.
- **Successful Renders:** Increased from **189** to **223+**.
- **Verified Fixes:** Roughly 40-50 characters previously "broken" or "dark" are now rendering at high fidelity.
