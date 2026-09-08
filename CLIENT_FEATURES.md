# Client-Side Features & Architecture Documentation

This document provides a comprehensive technical breakdown of all client-side features, user flows, UI components, state management contexts, real-time event listeners, and architectural patterns implemented in the **Muzhappilangad Drive-In Beach Management Application** client.

---

## Technical Stack & Architecture

* **Framework & Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [React Router v7](https://reactrouter.com/)
* **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/), Glassmorphism, Dark-mode first styling, [Lucide React Icons](https://lucide.dev/)
* **Mapping & Geolocation**: [Leaflet](https://leafletjs.com/), [React Leaflet](https://react-leaflet.js.org/), Browser Geolocation & Telemetry API
* **QR Code & Camera Scanning**: `html5-qrcode`, `qrcode.react`
* **Real-Time Communication**: Server-Sent Events (`EventSource`) for gate queues & issue updates, `Socket.IO Client` for live GPS tracking, emergency sirens, and remote maintenance locks
* **HTTP Client & Token Pipeline**: `Axios` with transparent JWT refresh token rotation interceptors

---

## 1. Authentication, Sessions & Security Pipeline

* **2-Hour Active User Session**:
  * Token TTL configured to **2 hours** (`2 * 60 * 60 * 1000` ms) across all active tabs, preventing premature session timeouts for tourists and residents on the beach.
* **Automatic Silent Refresh Token Rotation (`axios.js`)**:
  * An Axios response interceptor intercepts `401 Unauthorized` responses automatically.
  * Pauses failing API requests in a thread-safe queue.
  * Calls `/api/auth/refresh-token` with the 7-day refresh token.
  * Re-dispatches all queued requests transparently with the new JWT access token without logging the user out.
* **Role-Based Protected Routing (`ProtectedRoute.jsx`)**:
  * Strict permission boundaries segregating `USER` (Residents & Tourists), `ADMIN` (Gate Security Officers), and `MASTER_ADMIN` (System Administrators).
* **Multi-Method Authentication & Onboarding**:
  * **Gate Admin / Master Admin**: Secure credentials login (`/auth/login`).
  * **Local Resident Verification**: Search Panchayat Electoral Rolls by Name, SEC ID, or Ward, followed by phone verification and photo ID claiming.

---

## 2. Public Visitor (Tourist) Portal

### A. Online Gate Pass Ticket Purchase (`/entry`)
* **Dynamic Fee Calculation**: Select visitor count with instant total price calculation (₹20 standard tourist fee per person).
* **Payment Mode Selection**: Offline and cash desk payment options with idempotency token protection to eliminate duplicate checkout attempts.
* **Real-Time Approval Pipeline (`/entry/success`)**:
  * Listens to a dedicated Server-Sent Events (SSE) stream (`/api/entry/events/:orderId`).
  * Gate security approval triggers instant pass generation without requiring manual browser reload.
* **Dynamic Digital Tourist Pass**:
  * Generates high-contrast QR code upon verification.
  * Displays visitor count badge, validity countdown, purchase timestamp, and entry gate instructions.

### B. Public Incident & Safety Reporting (`/report`)
* **Guest Issue Submission**: Open to all public tourists without requiring account creation or login.
* **Categorized Issue Types**: *Garbage & Waste*, *Overflowing Bin*, *Reckless / Unsafe Driving*, *Damaged Infrastructure*, *Noise Complaint*, *Safety & Hazard*, *Other*.
* **Photo Capture & Attachment**: Direct integration with device camera or gallery picker.
* **Browser Telemetry & GPS Capture**: Automatically acquires high-accuracy GPS coordinates (Latitude, Longitude, Accuracy), device model, browser metadata, and network state.

---

## 3. Local Resident Portal (`/user/*`)

### A. Unified Hero Banner System (`BeachBanner.jsx`)
* Standardized aesthetic layout (`min-h-[210px] sm:min-h-[225px]`, `p-5 sm:p-6`, `rounded-3xl` glassmorphic gradients) across all resident tabs:
  * 🏠 **Home (`/user/home`)**: Authentic Muzhappilangad entrance photo.
  * 🎟️ **My Pass (`/user/my-pass`)**: Golden hour beach entrance at sunset.
  * 📋 **My Visits (`/user/my-visits`)**: Coastal palm road with beach tyre tracks.
  * 🛺 **Services & Directory (`/user/services`)**: Coastal scene with auto rickshaws, cafes, and shacks.
  * ⚠️ **My Reports (`/user/report`)**: Muzhappilangad lifeguard watchtower.
  * 👤 **Profile (`/user/profile`)**: Twilight dusk ocean horizon.
  * 🛡️ **Beach Rules (`/user/beach-rules`)**: Safety advisories with 1-tap quick access from the Home banner.

### B. Beach Services & Directory (`/user/services`) — Direct Auto Calling & Food Ordering
* **Direct Auto Rickshaw & Taxi Calling**:
  * **Driver Profiles**: Displays driver photo/avatar, driver name, vehicle registration number (e.g., `KL-13-AB-1234`), vehicle category (*Auto Rickshaw*, *4-Seater Cab*, *SUV Taxi*, *Traveller*), and stand location.
  * **1-Tap Direct Phone Call (`tel:`)**: Tapping the call button directly opens the smartphone phone dialer with the driver's verified contact number.
  * **Real-Time Dispatch Telemetry**: Emits a `service:call-click` event via Socket.IO to track ride requests with driver name, vehicle number, and timestamp in real-time.
* **Direct Food Ordering & Live Restaurant Menus**:
  * **Stall Explorer**: Browse beach shacks, cafes, and restaurants with cuisine tags, operating hours, ratings, and dish counts.
  * **Interactive Food Menu Modal**:
    * Categorized dish menu (*Main Course*, *Seafood Specials*, *Snacks & Quick Bites*, *Starters*, *Breads & Rice*, *Beverages*, *Desserts*).
    * Dietary badges (*Veg 🟢*, *Non-Veg 🔴*, *Seafood 🦐*), live in-stock indicators, and item prices.
  * **Dedicated Food Detail & Ordering Screen**:
    * Large food hero visual, description, prep time (15–20 mins), rating, and favorites bookmarking (❤️).
    * **Quantity Selector (`+` / `-`)**: Adjust dish servings with live bill calculation.
    * **"Call to Order" Direct Action**: 1-tap **`Call to Order (₹Total)`** button that sends the order metadata (`dishName`, `quantity`, `totalPrice`) over Socket.IO and launches the phone dialer to immediately place the order with the kitchen stall.
    * **"Recommended For You"**: Carousel displaying more signature dishes from the same stall.
* **Beachfront Resorts & Stays**:
  * Displays room tariffs per night, beach amenities, location, and direct reception phone calling.
* **Multi-Filter & Instant Search**:
  * Search instantly across driver names, vehicle numbers, restaurant stalls, dishes, cuisines, or locations.

### C. Digital Resident Gate Pass (`/user/my-pass`)
* **Free Beach Access QR Pass**: High-resolution dynamic QR code linked to the resident's validated Electoral Roll record.
* **Live Validity Status Indicator**: Displays active status badge, ward number, SEC ID, and registered resident profile image for gate guards.

### D. Visit History Logs (`/user/my-visits`)
* Chronological log of past beach drive-in entries with check-in timestamps, entry gate identifiers, and security officer verification badges.

### E. Resident Issue Reporting & Live Status Tracking (`/user/report`)
* **Submit Issue**: Report beach concerns with categories, description, photo attachment, and automated GPS tagging.
* **My Reports Feed**: Status tracking for all user-submitted tickets (*OPEN*, *IN_PROGRESS*, *RESOLVED*).
* **Live SSE Updates**: Server-Sent Events listener notifying the user immediately when a gate admin updates the resolution status of their report.

### F. Emergency SOS Alarm System
* Prominent red **Emergency SOS Button** on the user dashboard.
* Instantly triggers full-screen audio sirens and alert overlays across all active Gate Admin and Master Admin screens, transmitting live user identity and GPS coordinates.

### G. Live GPS Location Streaming
* Real-time GPS coordinate streaming to the Master live tracking system via Socket.IO when enabled by Master Admin feature flags.

---

## 4. Gate Admin Portal (`/admin/*`)

### A. Live Camera QR Scanner (`/admin/scan`)
* High-speed hardware camera QR scanner powered by `html5-qrcode`.
* Front and rear camera switching with flashlight/torch support.
* Instant validation for both **Resident Free Access Passes** and **General Paid Tourist Passes**.
* Audio chime feedback (success chime for valid passes, error buzzer for expired/invalid passes).

### B. Real-Time Pending Visitor Approval Queue (`AdminPendingVisitorAlert.jsx`)
* Live SSE notification feed alerting gate officers when a tourist requests gate entry.
* One-click **Approve Entry** or **Reject Entry** controls with automated ticket issuance.

### C. Manual Resident Search Fallback (`/admin/search`)
* Search electoral database by resident Name, SEC ID, or Ward number for visitors without smartphones or physical QR passes.
* One-tap manual gate entry logging directly into the database.

### D. Recent Gate Entries Log (`/admin/recent`)
* Real-time stream of recent entries at the current gate with entry classification (Paid Tourist vs. Free Resident), timestamps, and visitor counts.

### E. Gate Incident Management (`/admin/reports`)
* Dual-tab incident dashboard (*User Reports* vs. *Anonymous Reports*).
* Live SSE notifications on new beach incidents.
* Status progression buttons (*OPEN* ➔ *IN_PROGRESS* ➔ *RESOLVED*) with automatic push notifications to residents.

### F. Emergency SOS Live Alert Overlay (`AdminEmergencyOverlay.jsx`)
* Full-screen emergency modal with audible siren alarm.
* Displays user name, phone number, exact GPS coordinates, timestamp, and a direct **Google Maps Navigation Link**.
* One-click "Claim / Resolve Emergency" button to stop the alarm siren.

---

## 5. Master Admin Portal (`/master/*`)

### A. Tab Maintenance & Working Menu Lock System (`/master/tab-maintenance`)
* **Target Specific User Tabs**:
  * `My Reports & Issue Reporting` (`/user/report`)
  * `Beach Services & Rides Directory` (`/user/services`)
  * `Digital Resident Gate Pass` (`/user/my-pass`)
  * `My Visits & Access Log` (`/user/my-visits`)
  * `Beach Safety & Guidelines` (`/user/beach-rules`)
* **Visual Icon Picker**: 13 custom icons (*Wrench* 🛠️, *Construction* 🚧, *Alert* ⚠️, *Shield* 🛡️, *Clock* ⏳, *Lock* 🔒, *Sparkles* ✨, *Bell* 🔔, *Car* 🚗, *Utensils* 🍴, *Info* ℹ️, *Flame* 🔥).
* **Presets & Custom Text**: 1-click presets (*Routine Maintenance, System Upgrade, High Tide Weather Pause, Gate Sync*) and custom text entry.
* **User-Side Glassmorphic Lockout (`TabMaintenanceLockOverlay.jsx`)**: Full `backdrop-blur-lg bg-slate-950/80` glassmorphic overlay with animated pulsing icon, maintenance title, explanation, and "Return to Home" button.
* **Instant Socket.IO Sync**: Changes apply immediately across all client devices without page reloads.

### B. Beach Services & Directory Management (`/master/services`)
* **Auto & Taxi Management**: Add/Edit drivers with photo file upload, driver name, phone number, vehicle registration number, vehicle type, and stand location.
* **Restaurant & Food Menu Management**: Add restaurants with cover photos, cuisines, operating hours, and pure-veg flags.
* **Live Food Dish Manager**: Add dishes with dietary tags (*Veg*, *Non-Veg*, *Seafood*), pricing, today's special tag, and 1-click **In-Stock / Sold-Out** toggle switches.
* **Resorts & Stays Management**: Manage resort listings with room tariff rates, amenities checklist, and check-in times.

### C. Master Settings & Feature Control Matrix (`/master/features`)
* Real-time toggles for:
  * `emergencySosEnabled`: Controls user SOS button and admin sirens.
  * `publicReportEnabled`: Toggles public tourist incident reporting.
  * `userReportEnabled`: Toggles resident incident reporting tab.
  * `trackUserEnabled`: Toggles live GPS tracking and map streaming.
  * `orderFoodEnabled`: Toggles online food ordering module.
  * `resortBookingEnabled`: Toggles resort room booking module.

### D. Live GPS Track User Map (`/master/track-user`)
* Live Leaflet map displaying active beach visitors streaming GPS telemetry via Socket.IO.
* Real-time markers showing user speed, heading, battery status, and emergency SOS alerts.

### E. Executive Analytics & Dashboard (`/master/dashboard`, `/master/analytics`)
* Real-time KPI summary (*Total Entries, Paid Tourists, Resident Check-ins, Registered Residents, Open Reports*).
* Hourly traffic distribution graphs, revenue metrics, and visitor growth trends.

### F. Electoral Registry & Resident Pass Management (`/master/resident-records`, `/master/registered-residents`)
* Complete searchable voter roll database with filtering by Ward, SEC ID, or Name.
* One-click digital pass activation and access revocation controls.
* Drag-and-drop CSV/JSON bulk data importer (`/master/import`) with deduplication.

### G. Security Access & Admin Management (`/master/admins`, `/master/users`)
* Create and manage gate security officer accounts, assign entrance gate assignments, and manage user roles.

### H. System Audit Trail (`/master/activity-logs`)
* Immutable audit log tracking all administrative actions with actor metadata, timestamps, action types, and IP addresses.

### I. Broadcast Notifications (`/master/notifications`)
* Compose push announcements targeting specific roles (`USER`, `ADMIN`, `MASTER_ADMIN`) or all visitors with delivery history logs.

---

## 6. Client Contexts & State Architecture

| Context Provider | File Path | Core Responsibilities |
| :--- | :--- | :--- |
| **`AuthContext`** | `src/context/AuthContext.jsx` | User profile state, login/logout actions, role checking (`isMasterAdmin`, `isAdmin`, `isUser`), 2-hour session maintenance, and token persistence. |
| **`FeatureContext`** | `src/context/FeatureContext.jsx` | Master feature flag state (`emergencySosEnabled`, `trackUserEnabled`, etc.) with real-time Socket.IO synchronization. |
| **`TabMaintenanceContext`** | `src/context/TabMaintenanceContext.jsx` | Dynamic tab lock states, maintenance messages, icon configurations, and lock checking utilities. |
| **`SocketContext`** | `src/context/SocketContext.jsx` | Global Socket.IO client instance, connection lifecycle, and event emitter/listener bindings. |

---

## 7. UI / UX Design Standards

* **Aesthetic**: Premium dark-mode palette (`slate-950`, `slate-900`, `emerald-500`, `cyan-500`, `amber-500`, `rose-500`).
* **Glassmorphism**: Backdrop blur filters (`backdrop-blur-md`, `backdrop-blur-lg`) with semi-transparent borders (`border-white/10`).
* **Micro-Animations**: Smooth scale transitions on button hovers, pulsing indicators for live SSE/Socket connections, and dynamic QR code generation.
* **Mobile-First Responsive Layout**: Optimized for mobile touchscreens (smartphones carried by tourists and handheld devices used by gate guards) while maintaining full desktop responsiveness for Master Admin control centers.
