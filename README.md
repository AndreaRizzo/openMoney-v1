# OpenMoney

**OpenMoney** is an **open-source personal finance app** built with **React Native and Expo**, designed to give users full control over their financial data.  
No subscriptions. No tracking. No cloud dependency. Your data stays on your device.

The goal is simple:  
👉 **all your personal finances in one place**, clearly, securely, and transparently.

---

## Why OpenMoney exists

Most personal finance apps today:

- require recurring subscriptions
- sync sensitive data to external servers
- are not transparent about data usage
- lock essential features behind paywalls

**OpenMoney is the alternative**:

- 🧠 **Offline-first**. Works fully without internet
- 🔐 **Secure**. App lock with PIN and biometric authentication
- ♻️ **Open source**. Anyone can inspect, audit, and improve the code
- 💸 **Free forever**. No subscriptions, no hidden costs

---

## Key Features

- 📊 Dashboard with liquidity, net worth, and investments overview
- 💳 Accounts, wallets, and expense categories
- 🔁 Recurring income and expenses
- 📆 Transaction history and spending analysis
- 🔐 App lock with **PIN** and **biometrics** (Face ID on iOS, system biometrics on Android)
- 📱 Mobile-first UI for iOS and Android
- 📴 Fully functional **offline**

---

## Tech Stack

- **React Native**
- **Expo**
- **TypeScript**
- **SQLite (local database)**
- **expo-local-authentication** for biometrics
- **Expo Go** for fast local development

---

## Getting Started (Local Development)

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Expo CLI
- A physical device with **Expo Go** installed (iOS or Android)

---

### Installation

```bash
git clone https://github.com/<your-org-or-username>/openMoney-v1.git
cd openMoney-v1
npm install
```

---

### Run the app with Expo Go

```bash
npm start
```

- Scan the QR code using **Expo Go** on your phone
- The app will run directly on your device

👉 This is the recommended way to develop and contribute.

---

## Native Builds (Optional)

For full native testing (e.g. biometrics on real devices):

- **iOS**: build and run using **Xcode**
- **Android**: build using **Android Studio** or **EAS**

The project is already structured to support both platforms.

---

## Contributing

OpenMoney is **open source** and contributions are welcome.

You can contribute by:

- 🐛 Reporting bugs
- ✨ Proposing or implementing new features
- 🧹 Improving code quality, UX, or performance
- 📖 Improving documentation
- 🔐 Reviewing security and privacy aspects

### How to contribute

1. Fork the repository
2. Create a branch from `main`
3. Make your changes
4. Open a Pull Request with a clear description

---

## Contribution Guidelines

- Keep the code **clean and well-typed**
- Avoid unnecessary dependencies
- Privacy and security come first
- Features must work **offline by default**

---

## Privacy & Security

- No data is sent to external servers
- No analytics or tracking
- Local authentication via PIN or biometrics
- All data stays **on the user’s device**

---

## License

This project is released under the **MIT License**.  
You are free to use, modify, and distribute it.

---

## Project Status

🟢 **MVP nearly complete**

OpenMoney is currently in the stabilization phase, preparing for release on the App Store and Google Play Store.

---

If you want to help shape the future of personal finance apps, you are welcome to contribute.
