# Client-Side Features Documentation

This document provides a comprehensive overview of all client-side features, user flows, UI components, and architectural patterns implemented in the **Muzhappilangad Drive-In Beach Management Application**.

---

## Executive Overview
The client application is built with **React 19**, **Vite**, **React Router v7**, **Tailwind CSS v4**, and **Lucide React**. It provides three dedicated workflow portals:
1. **Public Visitor / Tourist Portal** (`/entry`, `/report`, `/user/services`)
2. **Local Resident Portal** (`/user/home`, `/user/my-pass`, `/user/my-visits`, `/user/services`, `/user/report`, `/user/profile`, `/user/beach-rules`)
3. **Gate Security Admin Portal** (`/admin/scan`, `/admin/search`, `/admin/recent`, `/admin/reports`, `/admin/profile`)
4. **Master Admin Portal** (`/master/dashboard`, `/master/tab-maintenance`, `/master/services`, `/master/features`, `/master/track-user`, `/master/resident-records`, `/master/registered-residents`, `/master/admins`, `/master/analytics`, `/master/activity-logs`, `/master/notifications`, `/master/reports`)

---

## 1. Authentication, Session & Token Management

* **2-Hour Active Session Window**:
  * Token expiration configured for **2 hours** (`2 * 60 * 60 * 1000` ms) across all active tabs.
* **Automatic Silent Refresh Token Rotation**:
  * The Axios HTTP client interceptor (`axios.js`) automatically detects `401 Unauthorized` responses and refreshes the JWT access token using the stored 7-day refresh token (`/api/auth/refresh-token`).
  * Request queueing ensures multiple simultaneous requests are paused and transparently replayed once the new token is acquired.
* **Multiple Auth Methods**:
  * Username & Password login for Admins and Master Admins.
  * Local resident phone & voter record linking for one-tap resident access.

---

## 2. User & Resident Workflow

### A. Unified Hero Banner System (`BeachBanner.jsx`)
* **Standardized Height & Aesthetics**: Uniform `min-h-[210px] sm:min-h-[225px]` height with `p-5 sm:p-6` padding, `rounded-3xl` corners, and dark gradient overlays.
* **Dedicated High-Resolution Beach Visuals**:
  * 🏠 **Home**: Authentic Muzhappilangad beach entrance photo.
  * 🎟️ **My Pass**: Golden hour gate entrance at sunset (`pass-banner.jpg`).
  * 📋 **My Visits**: Scenic coastal palm road with car tyre tracks (`visits-banner.jpg`).
  * 🛺 **Services & Directory**: Beach shore with auto rickshaws, cafes, and shacks (`services-banner.jpg`).
  * ⚠️ **My Reports**: Muzhappilangad beach lifeguard watchtower (`reports-banner.jpg`).
  * 👤 **Profile**: Twilight dusk sunset and calm waves (`profile-banner.jpg`).
  * 🛡️ **Beach Rules**: Beach safety guidelines with direct 1-tap navigation button from Home.

### B. Beach Services & Rides Directory (`/user/services`)
* **2-Column Responsive Grid (`grid-cols-2`)**:
  * **Auto & Taxi Rides**: Displays driver photo/avatar, driver name, vehicle registration number (`KL-13-AB-1234`), vehicle type pill, stand location, and direct 1-tap **"Call Driver"** action.
  * **Restaurants & Live Menus**: Displays restaurant cover photo, cuisines, operating hours, and dish count. Tapping opens the **Interactive Food Menu Modal** showing all dishes, Veg/Non-Veg/Seafood badges, live **In-Stock 🟢 / Sold-Out 🔴** status, and direct **Call to Order**.
  * **Resorts & Stays**: Displays tariff per night, amenities, and direct reception calling.
* **Filter Tabs & Instant Search**: Filter by *All Services*, *Auto & Taxi*, *Restaurants*, or *Resorts*.

### C. Resident Pass & Visits
* **Digital Free Access Pass (`/user/my-pass`)**: High-contrast QR code generated from voter registration for gate scanning.
* **Visit History Log (`/user/my-visits`)**: Complete historical log of gate entry scans.
* **Beach Rules (`/user/beach-rules`)**: Comprehensive safety guidelines and driving etiquette.

---

## 3. Gate Admin Workflow (`/admin/*`)

### A. Live Camera QR Scanner (`/admin/scan`)
* High-speed camera scanner (`html5-qrcode`) with front/rear camera toggle and audio chimes.

### B. Pending Visitor Approval Queue (`AdminPendingVisitorAlert.jsx`)
* Real-time SSE channel alerting officers of incoming tourist entry requests with 1-click Approve/Reject buttons.

### C. Incident Management (`/admin/reports`)
* Dual-tab management for *User Reports* and *Anonymous Reports* with status progression controls (*OPEN* ➔ *IN_PROGRESS* ➔ *RESOLVED*).

### D. Emergency SOS Live Alert Overlay (`AdminEmergencyOverlay.jsx`)
* Full-screen audio siren with user details, exact GPS coordinates, and direct Google Maps routing.

---

## 4. Master Admin Workflow (`/master/*`)

### A. Tab Maintenance & Working Menu Lock Controls (`/master/tab-maintenance`)
* **Lock Any User Tab**: Suspend `/user/report`, `/user/services`, `/user/my-pass`, `/user/my-visits`, or `/user/beach-rules`.
* **Visual Icon Picker**: Choose from 13 custom icons (*Wrench*, *Construction*, *Alert*, *Shield*, *Clock*, *Lock*, *Sparkles*, *Bell*, *Car*, *Utensils*, *Info*, *Flame*).
* **Custom Notice Headings & Descriptions**: 1-click presets and custom text.
* **User-Side Glassmorphic Lockout**: Renders a `backdrop-blur-lg bg-slate-950/80` glassmorphic overlay with animated pulsing icon and explanation, blocking user actions.
* **Real-Time Synchronization**: Instantly synced via Socket.IO.

### B. Services Directory Management (`/master/services`)
* **Auto/Taxi Manager**: Add/Edit drivers with photo file upload picker, driver name, phone, vehicle registration number, and stand location.
* **Restaurant & Food Menu Manager**: Add restaurants with photo upload and manage individual menu dishes with live **In-Stock / Sold-Out** toggle switches.
* **Resorts Manager**: Manage stays, room tariffs, and amenities.

### C. Master Controls & Analytics
* **Feature Controls Matrix (`/master/features`)**: Real-time toggles for Emergency SOS, Public Reports, User Reports, Live GPS Tracking, Food Ordering, and Resort Booking.
* **Live GPS User Tracking Map (`/master/track-user`)**: Interactive Leaflet map with real-time location streaming.
* **Analytics Dashboard (`/master/dashboard`, `/master/analytics`)**: Real-time KPI counters and hourly traffic charts.
* **Electoral Registry (`/master/resident-records`) & Pass Management (`/master/registered-residents`)**: Voter roll search and pass access revocation.
* **Audit Logs (`/master/activity-logs`)**: Complete audit trail of administrative actions.
