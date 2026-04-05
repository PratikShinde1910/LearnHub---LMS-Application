#  LearnHub - Mini LMS Mobile App

A modern **Learning Management System (LMS)** mobile application built using React Native and Expo. This app allows users to explore courses, enroll, and consume learning content through an integrated WebView-based player.

Demo Video Link - https://drive.google.com/file/d/1ESTUm07EMKcOGejNtuRI0v-5QH8pYOqS/view?usp=sharing

APK File - https://expo.dev/accounts/pratik_69/projects/learnhub/builds/6925f362-eb12-4ffb-8501-14715d4ca90d

---



<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/cd921b33-8726-4fb2-800f-11a23516ac10" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/46f3e2b0-6a40-46ae-b28e-ca842c710a9b" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/3e081b54-3803-4e9f-b520-d8e6c6a4df66" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/c33e4caf-34a8-481c-b912-583a8fdd2785" width="220"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/eb7411b3-0324-4efb-8207-d4e2ea0df46a" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/cae90ee0-0cb6-4e70-9943-364bf665daca" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/7b4e76e0-281e-4412-9bf6-4db218097b42" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/5a79e547-535f-4cde-9e2b-ab86e859ece1" width="220"/></td>
  </tr>
</table>

## 🚀 Features

* 📚 Browse courses by domain (Technology, Design, Lifestyle, Health)
* 🔍 Search courses
* ⭐ Bookmark favorite courses
* 📖 View detailed course information
* ✅ Enroll in courses with visual feedback
* 🌐 WebView-based learning experience (HTML content)
* 📊 Track course progress
* 📦 Offline support using local storage (AsyncStorage)

---

## 🧱 Tech Stack

* React Native (Expo)
* Expo Router (File-based routing)
* TypeScript
* Axios (API handling)
* AsyncStorage (Offline caching)
* React Context + useReducer (State management)
* react-native-webview

---

## 📂 Project Structure

```
app/
  (auth)/         → Login & Register screens
  (tabs)/         → Home, Bookmarks, Profile
  course/         → Course Details & WebView
components/       → Reusable UI components
store/            → Global state management
services/         → API services
utils/            → Helper functions
constants/        → Static data & mappings
assets/           → Images & icons
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/PratikShinde1910/LearnHub---LMS-Application.git
cd YOUR_REPO
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Start Development Server

```bash
npx expo start
```

---

### 4. Run App

* Press `a` → Run on Android Emulator
* OR scan QR using Expo Go (Android)

---

## 📦 APK Build

To generate APK:

```bash
npx expo install eas-cli
npx eas build -p android --profile preview
```

👉 Download APK from the provided build link

---

## 🌐 WebView Integration

* Course content is rendered using **local HTML templates**
* Native → WebView communication handled via headers
* Supports:

  * Chapter navigation
  * Progress tracking
  * Mark as complete

---

## 🔐 Environment Variables

No external environment variables required for this project.

---

## 🧠 Key Architectural Decisions

* **Expo Router** for scalable navigation
* **Context + Reducer** for modular state management
* **Static mapping for course thumbnails** (reliable UI)
* **WebView for flexible content delivery**
* **AsyncStorage for offline support**

---

## ⚠️ Known Limitations

* API provides mock/random product data (used as course data)
* No real backend authentication
* Limited offline support (API requires internet initially)
* WebView content is static (demo purpose)

---

## 📸 Screenshots

* Home Screen
* Course Detail Screen
* WebView Learning Screen
* Bookmarks Screen

---

## 🎥 Demo Video

Includes:

* App walkthrough
* Course browsing
* Enrollment flow
* WebView learning
* Offline behavior

---

## 📌 Summary

This project demonstrates:

* Clean architecture
* Scalable React Native setup
* Real-world LMS features
* Strong UI/UX practices

---

## 👨‍💻 Author

**Pratik Shinde**

---
