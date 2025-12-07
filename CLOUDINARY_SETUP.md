# Cloudinary Setup Guide

## Step 1: Create a Free Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com/)
2. Click **Sign Up** (it's free!)
3. Choose the **Free Plan** (includes 25GB storage & 25GB bandwidth/month)

## Step 2: Get Your Credentials

After signing in, you'll see your **Dashboard**:

1. Copy your **Cloud Name** (e.g., `dxyz123abc`)
2. We'll set up the Upload Preset next

## Step 3: Create an Upload Preset

Upload presets allow unsigned uploads from your browser (secure and easy):

1. In Cloudinary dashboard, click **Settings** (gear icon top-right)
2. Navigate to **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Configure:
   - **Signing Mode**: Select **Unsigned**
   - **Preset name**: Enter something like `certificate_uploads`
   - **Folder**: (Optional) Enter `certificates` to organize uploads
   - Leave other settings as default
6. Click **Save**
7. Copy the **Upload preset name**

## Step 4: Update Your .env File

Add these lines to your `.env` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=certificate_uploads
```

Replace `your_cloud_name_here` with your actual Cloud Name from Step 2.

## Step 5: Restart Dev Server

After updating `.env`, restart your development server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## That's It!

Your app will now:
- ✅ Upload background images to Cloudinary when saving templates
- ✅ Store only the Cloudinary URL in Firebase (no size limits!)
- ✅ Automatically load images from Cloudinary when using templates
- ✅ Upload generated certificates to Cloudinary for long-term storage

## Verification

Check your browser console when saving a template - you should see:
```
Background image detected: XXX KB
Uploading to Cloudinary...
Uploaded successfully: https://res.cloudinary.com/...
```

**CORS Handling:** Cloudinary automatically serves images with proper CORS headers (`Access-Control-Allow-Origin: *`), so the app can load and export canvas images without "tainted canvas" errors.

## Free Tier Limits

The free plan includes:
- 25GB Storage
- 25GB Bandwidth/month
- 2,500 transformations/month

This is more than enough for most certificate generation apps!
