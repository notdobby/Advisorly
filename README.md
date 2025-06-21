# Financial Vault - Personal Finance Management App

A modern, secure personal finance management application built with React, TypeScript, and Supabase. Features wallet management, transaction tracking, SMS parsing, and AI-powered financial insights.

## 🚀 Features

- **🔐 Secure Authentication** - Google OAuth integration with Supabase
- **💰 Wallet Management** - Create and manage multiple wallets (Savings, Wants, Needs)
- **📊 Transaction Tracking** - Add, edit, and delete transactions with categories
- **📱 SMS Parsing** - Automatic bank transaction detection from SMS
- **🤖 AI Suggestions** - AI-powered financial insights and recommendations
- **📈 Dashboard Analytics** - Visual progress tracking and spending insights
- **⚙️ Settings Management** - Currency, salary date, and theme preferences
- **📱 PWA Support** - Progressive Web App with offline capabilities
- **🔧 Mobile Ready** - Capacitor integration for native mobile apps

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tool**: Vite
- **Mobile**: Capacitor
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd financial-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Setup

The application uses Supabase with the following tables:

- `users` - User profiles and preferences
- `wallets` - User wallet configurations
- `transactions` - Financial transactions
- `bank_transactions` - Parsed SMS transactions

Run the SQL schema from `backend/supabaseSchema.sql` in your Supabase SQL editor.

## 📱 Mobile Development

### Android Setup
```bash
npm run cap:add android
npm run cap:sync
npm run cap:run android
```

### iOS Setup (macOS only)
```bash
npm run cap:add ios
npm run cap:sync
npm run cap:run ios
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Build
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run cap:add` - Add Capacitor platform
- `npm run cap:sync` - Sync web code to native
- `npm run cap:build` - Build native app
- `npm run cap:run` - Run on device/emulator

## 📁 Project Structure

```
financial-vault/
├── src/
│   ├── pages/          # React components
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Layout components
│   └── index.tsx       # App entry point
├── frontend/           # Frontend utilities
│   ├── auth.ts         # Authentication functions
│   ├── api.ts          # API functions
│   └── supabaseClient.ts # Supabase configuration
├── public/             # Static assets
├── android/            # Android native code
├── backend/            # Database schema
└── capacitor.config.ts # Capacitor configuration
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/financial-vault/issues) page
2. Create a new issue with detailed information
3. Include browser console errors and steps to reproduce

## 🔄 Updates

Stay updated with the latest features and bug fixes by:

1. Following the repository
2. Checking the [Releases](https://github.com/yourusername/financial-vault/releases) page
3. Reading the [Changelog](CHANGELOG.md)

---

**Built with ❤️ using React, TypeScript, and Supabase**
