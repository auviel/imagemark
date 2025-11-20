# ShortPixel Image Optimization Setup Guide

This guide explains how ShortPixel is integrated into this project for automatic image optimization during the build process.

## Table of Contents

1. [Overview](#overview)
2. [What is ShortPixel?](#what-is-shortpixel)
3. [Dependencies](#dependencies)
4. [Environment Variables](#environment-variables)
5. [Script Architecture](#script-architecture)
6. [Build Integration](#build-integration)
7. [Setup for New Project](#setup-for-new-project)
8. [Configuration Options](#configuration-options)
9. [How It Works](#how-it-works)
10. [Troubleshooting](#troubleshooting)

---

## Overview

ShortPixel is integrated as a **post-build step** that automatically optimizes all images in your `dist` folder after the build completes. The optimization happens via ShortPixel's API, which compresses images and optionally converts them to WebP format.

**Key Features:**

- ✅ Automatic image optimization after build
- ✅ Supports PNG, JPG, JPEG, WebP formats
- ✅ Configurable compression (lossy, lossless, glossy)
- ✅ Optional WebP conversion
- ✅ Rate limiting and concurrency control
- ✅ Retry logic for failed downloads
- ✅ Graceful error handling (build continues even if optimization fails)

---

## What is ShortPixel?

ShortPixel is a cloud-based image optimization service that:

- Reduces image file sizes by 30-80% without noticeable quality loss
- Converts images to modern formats (WebP, AVIF)
- Provides three compression modes: lossy, lossless, and glossy
- Offers a free tier (100 images/month) and paid plans

**API Endpoint Used:** `https://api.shortpixel.com/v2/post-reducer.php`

---

## Dependencies

The following npm packages are required:

```json
{
  "devDependencies": {
    "dotenv": "^16.4.5",
    "form-data": "^4.0.0"
  }
}
```

**Why these packages?**

- `dotenv`: Loads environment variables from `.env` file
- `form-data`: Creates multipart/form-data for file uploads to ShortPixel API

**Installation:**

```bash
npm install --save-dev dotenv form-data
```

---

## Environment Variables

The script uses the following environment variables (all optional except `SHORTPIXEL_API_KEY`):

### Required

| Variable             | Description             | Example           |
| -------------------- | ----------------------- | ----------------- |
| `SHORTPIXEL_API_KEY` | Your ShortPixel API key | `abc123def456...` |

### Optional Configuration

| Variable                 | Default  | Description                                                  |
| ------------------------ | -------- | ------------------------------------------------------------ |
| `SHORTPIXEL_COMPRESSION` | `lossy`  | Compression type: `lossy`, `lossless`, or `glossy`           |
| `SHORTPIXEL_WEBP`        | `false`  | Convert images to WebP: `true` or `false`                    |
| `SHORTPIXEL_CONCURRENCY` | `2`      | Number of simultaneous API requests (1-5 recommended)        |
| `SHORTPIXEL_MAX_SIZE_MB` | `10`     | Maximum file size in MB (files larger are skipped)           |
| `SHORTPIXEL_DELAY_MS`    | `500`    | Delay between requests in milliseconds                       |
| `SHORTPIXEL_DIRECTORIES` | `images` | Comma-separated directories to scan (relative to `dist/`)    |
| `SHORTPIXEL_EXCLUDE`     | (none)   | Comma-separated patterns to exclude (supports `*` wildcards) |

### Example `.env` file

```env
# Required
SHORTPIXEL_API_KEY=your_api_key_here

# Optional - customize as needed
SHORTPIXEL_COMPRESSION=lossy
SHORTPIXEL_WEBP=true
SHORTPIXEL_CONCURRENCY=2
SHORTPIXEL_MAX_SIZE_MB=10
SHORTPIXEL_DELAY_MS=500
SHORTPIXEL_DIRECTORIES=images,assets/images
SHORTPIXEL_EXCLUDE=logo.png,*.svg,watermark/*
```

### Getting Your API Key

1. Sign up at [ShortPixel.com](https://shortpixel.com)
2. Go to your dashboard
3. Navigate to API section
4. Copy your API key

### Setting Environment Variables

**Local Development:**

- Create a `.env` file in the project root
- Add your variables (don't commit this file!)

**Vercel/Production:**

- Go to your project settings
- Navigate to Environment Variables
- Add `SHORTPIXEL_API_KEY` and any other variables
- They'll be available during build time

---

## Script Architecture

The optimization script (`scripts/optimize-images.js`) consists of:

### Main Functions

1. **`getAllImages(dir, fileList, baseDir)`**
   - Recursively scans directories for image files
   - Filters by supported formats (PNG, JPG, JPEG, WebP)
   - Applies exclude patterns
   - Returns array of image file paths

2. **`shouldExclude(filePath, baseDir)`**
   - Checks if file matches exclude patterns
   - Supports wildcards (`*`, `?`)

3. **`optimizeImage(imagePath)`**
   - Uploads image to ShortPixel API
   - Handles API response
   - Downloads optimized image
   - Replaces original file
   - Returns optimization stats

4. **`downloadOptimizedImage(url, savePath, retries)`**
   - Downloads optimized image from ShortPixel
   - Implements retry logic (3 attempts)
   - Handles redirects and errors
   - Replaces original only if smaller

5. **`processImages(images)`**
   - Processes images with rate limiting
   - Controls concurrency
   - Adds delays between requests
   - Returns array of results

6. **`main()`**
   - Entry point
   - Scans configured directories
   - Processes all images
   - Displays summary statistics

### Flow Diagram

```
Build completes → dist/ folder created
       ↓
optimize-images.js runs
       ↓
Scans dist/images/ (or configured dirs)
       ↓
For each image:
  ├─ Check file size (skip if > max)
  ├─ Upload to ShortPixel API
  ├─ Wait for processing
  ├─ Download optimized version
  └─ Replace original if smaller
       ↓
Display summary statistics
```

---

## Build Integration

### Package.json Scripts

```json
{
  "scripts": {
    "build": "vite build && node post-build.js",
    "build:optimize": "vite build && node post-build.js && node scripts/optimize-images.js",
    "optimize": "node scripts/optimize-images.js"
  }
}
```

**Script Breakdown:**

- `build`: Standard build without optimization
- `build:optimize`: Full build with image optimization
- `optimize`: Run optimization on existing `dist/` folder

### Vercel Integration

The `vercel.json` file configures the build command:

```json
{
  "buildCommand": "npm run build:optimize",
  "outputDirectory": "dist"
}
```

This ensures images are optimized on every Vercel deployment.

### Build Process Flow

```
1. npm run build:optimize
   ↓
2. vite build
   (Creates dist/ folder with all assets)
   ↓
3. node post-build.js
   (Post-processing: renames JS files, updates HTML)
   ↓
4. node scripts/optimize-images.js
   (Optimizes all images in dist/)
   ↓
5. Build complete - optimized images ready!
```

---

## Setup for New Project

Follow these steps to integrate ShortPixel into a new project:

### Step 1: Install Dependencies

```bash
npm install --save-dev dotenv form-data
```

### Step 2: Create the Script

Create `scripts/optimize-images.js` and copy the entire script from this project.

**Key points:**

- Script uses ES6 modules (`import/export`)
- Requires Node.js 18+ (for ES modules)
- Uses `dotenv` to load environment variables
- Uses `form-data` for multipart uploads

### Step 3: Update package.json

Add the scripts:

```json
{
  "type": "module", // Required for ES modules
  "scripts": {
    "build": "vite build && node post-build.js",
    "build:optimize": "vite build && node post-build.js && node scripts/optimize-images.js",
    "optimize": "node scripts/optimize-images.js"
  },
  "devDependencies": {
    "dotenv": "^16.4.5",
    "form-data": "^4.0.0"
  }
}
```

### Step 4: Create .env File

Create `.env` in project root:

```env
SHORTPIXEL_API_KEY=your_api_key_here
SHORTPIXEL_COMPRESSION=lossy
SHORTPIXEL_WEBP=true
```

**Important:** Add `.env` to `.gitignore`!

### Step 5: Configure Build System

**For Vite projects:**

- Already configured if using the same structure

**For other build systems:**

- Update your build command to include `node scripts/optimize-images.js`
- Ensure it runs AFTER the build completes
- Ensure `dist/` folder exists before optimization

### Step 6: Test Locally

```bash
# Build and optimize
npm run build:optimize

# Or optimize existing build
npm run optimize
```

### Step 7: Configure Production Environment

**Vercel:**

1. Go to Project Settings → Environment Variables
2. Add `SHORTPIXEL_API_KEY`
3. Add any other configuration variables
4. Update `vercel.json` build command if needed

**Other platforms:**

- Add environment variables in your platform's settings
- Ensure they're available during build time

---

## Configuration Options

### Compression Types

| Type       | Description                              | Use Case            |
| ---------- | ---------------------------------------- | ------------------- |
| `lossy`    | Maximum compression, slight quality loss | Web images, photos  |
| `lossless` | No quality loss, moderate compression    | Logos, graphics     |
| `glossy`   | Balanced compression and quality         | High-quality photos |

### Directory Configuration

By default, the script scans `dist/images/`. To scan multiple directories:

```env
SHORTPIXEL_DIRECTORIES=images,assets/images,public/images
```

### Exclude Patterns

Exclude specific files or patterns:

```env
SHORTPIXEL_EXCLUDE=logo.png,*.svg,watermark/*,icons/*
```

**Pattern syntax:**

- `logo.png` - Exact filename
- `*.svg` - All SVG files
- `watermark/*` - All files in watermark folder
- `icons/*.png` - All PNGs in icons folder

### Concurrency Settings

Control how many images are processed simultaneously:

```env
SHORTPIXEL_CONCURRENCY=2  # Recommended: 1-5
```

**Guidelines:**

- Lower (1-2): More reliable, slower
- Higher (3-5): Faster, but may hit rate limits
- Default (2): Good balance

### WebP Conversion

Enable automatic WebP conversion:

```env
SHORTPIXEL_WEBP=true
```

**Note:** This creates WebP versions alongside originals. The script currently replaces originals, so you may want to modify it to keep both formats.

---

## How It Works

### API Request Flow

1. **Upload Image**

   ```
   POST https://api.shortpixel.com/v2/post-reducer.php
   Content-Type: multipart/form-data

   Form Data:
   - key: API_KEY
   - lossy: 1 (or lossless/glossy)
   - convertto: +webp (if enabled)
   - wait: 30 (seconds to wait)
   - file_paths: {"file1": "image.png"}
   - file1: [binary image data]
   ```

2. **API Response**

   ```json
   {
     "Status": {
       "Code": 2,
       "Message": "Success"
     },
     "LossyURL": "https://...",
     "PercentImprovement": "45.2"
   }
   ```

3. **Status Codes**
   - `1`: Processing (image is being optimized)
   - `2`: Success (optimized image ready)
   - Other: Error (check message)

4. **Download & Replace**
   - Downloads optimized image from `LossyURL`
   - Compares file sizes
   - Replaces original only if smaller
   - Handles retries on network errors

### Error Handling

The script is designed to **never break your build**:

- Missing API key: Exits gracefully with warning
- API errors: Logs error, continues with next image
- Network errors: Retries 3 times, then skips
- Large files: Skips automatically
- SVG files: Skips (ShortPixel doesn't support SVG)

### Rate Limiting

To avoid hitting API rate limits:

- Configurable concurrency (default: 2 simultaneous)
- Delay between requests (default: 500ms)
- Retry logic with exponential backoff

---

## Troubleshooting

### Issue: "SHORTPIXEL_API_KEY not found"

**Solution:**

- Check `.env` file exists in project root
- Verify variable name is exactly `SHORTPIXEL_API_KEY`
- For production, check environment variables in deployment platform

### Issue: "Invalid API key" errors

**Solution:**

- Verify API key is correct (no extra spaces)
- Check API key is active in ShortPixel dashboard
- Ensure you have available credits

### Issue: Images not being optimized

**Check:**

1. Are images in the correct directory? (default: `dist/images/`)
2. Are file formats supported? (PNG, JPG, JPEG, WebP)
3. Are files too large? (default max: 10MB)
4. Are files excluded by patterns?
5. Check console output for specific errors

### Issue: Build takes too long

**Solutions:**

- Reduce `SHORTPIXEL_CONCURRENCY` (but this makes it slower)
- Increase `SHORTPIXEL_DELAY_MS` to avoid rate limits
- Exclude unnecessary images with `SHORTPIXEL_EXCLUDE`
- Consider optimizing only production builds

### Issue: Some images fail to optimize

**Common causes:**

- Network timeouts (script retries automatically)
- API rate limits (reduce concurrency)
- Corrupted image files
- Unsupported formats

**Solution:** Check console output for specific error messages.

### Issue: Optimized images are larger

**Why:** Sometimes optimization doesn't reduce size (especially already-optimized images).

**Solution:** The script only replaces originals if the optimized version is smaller, so this shouldn't be a problem.

---

## Best Practices

1. **Don't commit `.env` file** - Add to `.gitignore`
2. **Use different API keys** for development and production
3. **Monitor API usage** in ShortPixel dashboard
4. **Test locally first** before deploying
5. **Optimize only production builds** to save API credits
6. **Exclude already-optimized images** to save time
7. **Set appropriate concurrency** based on your API plan

---

## API Limits

ShortPixel free tier:

- 100 images/month
- 10MB max file size
- Standard processing speed

Paid plans offer:

- More images/month
- Larger file sizes
- Faster processing
- Priority support

Check your plan limits in the ShortPixel dashboard.

---

## Alternative: Local Optimization

If you prefer not to use ShortPixel API, consider:

- **sharp**: Node.js image processing library
- **imagemin**: Image optimization plugins
- **squoosh**: Google's image optimization tool

These run locally but may be slower and require more setup.

---

## Summary

ShortPixel integration provides:

- ✅ Automatic image optimization
- ✅ Configurable compression settings
- ✅ WebP conversion support
- ✅ Graceful error handling
- ✅ Build-time optimization
- ✅ Detailed statistics

The setup is production-ready and designed to never break your build process.

---

## Quick Reference

**Required Files:**

- `scripts/optimize-images.js` - Main optimization script
- `.env` - Environment variables (local)
- `package.json` - Scripts and dependencies

**Required Environment Variables:**

- `SHORTPIXEL_API_KEY` (required)

**Build Command:**

```bash
npm run build:optimize
```

**Test Command:**

```bash
npm run optimize
```

---

For questions or issues, refer to:

- [ShortPixel API Documentation](https://shortpixel.com/api-docs)
- Project README.md
- Script comments in `optimize-images.js`
