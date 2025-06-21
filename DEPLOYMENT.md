# Deployment Guide

This guide covers deploying the Financial Vault application to various hosting platforms.

## 🚀 Quick Deploy Options

### Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Deploy**
   - Vercel will automatically detect it's a Vite project
   - Build command: `npm run build`
   - Output directory: `dist`
   - Deploy!

### Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "New site from Git"

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add your Supabase credentials

### GitHub Pages

1. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/financial-vault",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Manual Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the project
npm run build

# The built files will be in the `dist/` directory
```

### Upload to Hosting Provider

1. **Upload the `dist/` folder** to your hosting provider
2. **Configure environment variables** in your hosting dashboard
3. **Set up custom domain** (optional)

## 📱 Mobile App Deployment

### Android

1. **Build APK**
   ```bash
   npm run cap:sync
   npm run cap:build android
   ```

2. **Generate Signed APK**
   - Open Android Studio
   - Open the `android/` folder
   - Build → Generate Signed Bundle/APK

3. **Upload to Google Play Console**

### iOS

1. **Build for iOS**
   ```bash
   npm run cap:sync
   npm run cap:build ios
   ```

2. **Open in Xcode**
   ```bash
   npm run cap:open ios
   ```

3. **Archive and Upload to App Store Connect**

## 🔐 Environment Variables

Create a `.env` file for local development:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit `.env` files to Git!

## 🌐 Domain Configuration

### Custom Domain Setup

1. **Add custom domain** in your hosting provider
2. **Update Supabase Auth settings**:
   - Go to Authentication → URL Configuration
   - Add your domain to allowed redirect URLs
   - Add your domain to allowed sites

### SSL Certificate

Most hosting providers automatically provide SSL certificates. Ensure HTTPS is enabled.

## 📊 Performance Optimization

### Build Optimization

1. **Enable compression** in your hosting provider
2. **Set up CDN** for static assets
3. **Configure caching headers**:
   ```
   Cache-Control: public, max-age=31536000
   ```

### PWA Configuration

1. **Update manifest.json** with your domain
2. **Test service worker** functionality
3. **Verify offline capabilities**

## 🔍 Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase Auth redirect URLs updated
- [ ] SSL certificate active
- [ ] PWA manifest working
- [ ] Service worker registered
- [ ] Mobile responsiveness tested
- [ ] Performance optimized
- [ ] Analytics configured (optional)

## 🆘 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 16+)
   - Verify all dependencies installed
   - Check for TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables are prefixed with `VITE_`
   - Restart development server after adding variables
   - Check hosting provider configuration

3. **Authentication Issues**
   - Verify Supabase URL and keys
   - Check redirect URLs in Supabase dashboard
   - Ensure HTTPS is enabled

4. **PWA Not Working**
   - Verify manifest.json is accessible
   - Check service worker registration
   - Test offline functionality

### Support

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/yourusername/financial-vault/issues)
2. Review the [documentation](README.md)
3. Create a new issue with detailed information

---

**Happy Deploying! 🚀** 