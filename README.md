# 📱 EventHiveMobile

A cross-platform **event booking mobile app** built using **React Native** and **Expo**, developed for the IFN666 course assessment at QUT. This mobile client consumes a custom REST API backend from Assessment 2, allowing users to explore, book, and manage event registrations.

---

## 🗂 Folder Structure

```
.
├── app/                  # Main app screens and navigation
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── (tabs)/           # Main tabbed navigation pages (home, bookings, profile)
│   ├── EventForm/        # Admin-only screens for creating/editing events
│   └── events/           # Event details screen
│
├── assets/               # Logos, images, icons
├── components/           # Reusable UI components
├── constants/            # Color palettes, text, etc.
├── hooks/                # Custom React hooks
├── lib/                  # Axios config, utility functions
├── scripts/              # Setup / migration scripts
├── app.json              # Expo app configuration
├── eslint.config.js      # Linting setup
└── README.md             # Project documentation (you’re reading it!)
```

---

## 🚀 Features

### ✅ Core Functionality
- 🔐 **Authentication**: Login/Register with email and password
- 🏠 **Home Page**: Explore events with pagination
- 📄 **Event Details**: Book tickets, view seat availability
- 🎫 **Bookings Page**: See your booked events with ticket quantity and status
- 👤 **Profile Page**: View and update your profile details
- 🛠️ **Admin Support**:
  - Edit/Create event screens
  - Manage all bookings via a unified Bookings screen

### ✅ Additional Features
- 📦 **Safe Area Handling**: Compatible with notches and curved screens
- 📶 **Pull-to-Refresh**: On Event list and Bookings
- 🔁 **Swipe-to-Cancel (Admin)**: Gesture to update booking status
- 🔗 **Share Event**: Share event details via device's native share menu
- 🟦 **Status Bar Integration**: Consistent color theming across screens

---

## 🔧 Technologies & Tools

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/) for API requests
- [React Navigation](https://reactnavigation.org/) + Expo Router
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)

---

## 📡 API Integration

The app connects to a custom-built REST API hosted from the web version of EventHive (Assessment 2). All features including:
- authentication
- events listing
- bookings
- user updates

are handled using authenticated API requests with JWT tokens.

---

## 🧪 Error Handling

- Input validation (e.g. invalid email/password formats)
- API error catch blocks with feedback messages
- Edge case handling (e.g. booking more seats than available)

---

## 📽️ Demo Tips (for assessment video)

When recording your demo:
- Start with splash/login
- Navigate through **Home → Event → Book → Profile**
- Show a failed login or network error
- Swipe to cancel booking (admin)
- Share event via native menu
- Show code in `EventFormScreen.tsx`, `axiosConfig.ts`, and `bookings.tsx`
- End with `README.md` and show project structure in VSCode

---

## 📜 Setup Instructions

```bash
# Install dependencies
npm install

# Start Expo server
npx expo start
```

> 🔐 Ensure `.env` or token setup is correct if used

---

## ✅ Assessment Criteria Checklist

| Criteria                        | Status       |
|-------------------------------|--------------|
| Core: Development Workflow     | ✅ Implemented |
| Core: Core Functionality       | ✅ Full CRUD, auth |
| Core: UI Design                | ✅ Clean + intuitive |
| Core: API Integration          | ✅ Connected to custom backend |
| Additional: Safe Areas         | ✅ Implemented |
| Additional: Status Bar         | ✅ Themed integration |
| Additional: Gestures           | ✅ Pull-to-refresh, swipe |
| Additional: Share              | ✅ Event sharing added |