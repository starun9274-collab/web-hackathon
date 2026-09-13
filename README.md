# Life RPG — Minimal Modern Fantasy Task Mastery Web App

Life RPG turns real-world tasks and habits into immersive RPG quests. By categorizing responsibilities into **Study**, **Exercise**, **Habit**, and **Creative**, users earn XP, accumulate coins, maintain activity streaks, enhance core character attributes, and unlock virtual prestige rewards in a clean, distraction-free fantasy interface.

---

## 1. Problem Statement & Overview

Traditional to-do apps often suffer from abandonment because they lack intrinsic and extrinsic motivational feedback loops. Conversely, existing gamified productivity apps frequently suffer from feature bloat, complex RPG combat mechanics, cluttered interfaces, or client-side vulnerable statistics.

**Life RPG** solves this by:
* Maintaining a **minimal, modern dark fantasy aesthetic** without childish clutter or generic SaaS cards.
* Enforcing **authoritative server-side calculations** to protect XP, coins, streaks, and attributes from client tampering.
* Providing a **non-linear progression curve** where each level demands genuine dedication.
* Delivering **instant, celebratory completion feedback** when milestones and levels are achieved.
* Retaining all data securely with **Firebase Authentication** and **Cloud Firestore**.

---

## 2. Core Features

### ⚔️ Quest System (Real Firestore CRUD)
* **Create**: Add real-world quests with title and category.
* **Automatic Rewards**: XP and Coins are determined automatically based on the chosen category:
  * **Study**: +40 XP, +10 Coins, improves **Intellect**
  * **Exercise**: +40 XP, +10 Coins, improves **Strength**
  * **Habit**: +30 XP, +10 Coins, improves **Discipline**
  * **Creative**: +40 XP, +10 Coins, improves **Creativity**
* **Read / Filter**: Toggle between Active Quests and Chronicle Archive (completed quests).
* **Edit**: Update quest title or category seamlessly.
* **Delete**: Remove quests with confirmation dialogs.
* **Complete**: Authoritative progression triggering level checks, streak updates, and celebratory modal dialogs.

### 📈 Non-Linear Level Progression
* Level advancement is calculated using the formula:
  $$\text{XP Required for Next Level} = 100 \times \text{Level}^{1.5}$$
* Excess XP is preserved across level promotions.
* Real-time animated progress bar displaying current XP, required XP, and percentage.

### 🔥 Reliable Activity Streak Tracking
* Completing at least one quest per day maintains and advances your streak.
* Completing multiple quests on the same day maintains the streak without duplicate inflation.
* Missing one or more calendar days resets the streak to 1 upon the next completed quest.

### 🧠 Four Core Character Attributes
* **Intellect**: Boosted by Study quests.
* **Strength**: Boosted by Exercise quests.
* **Discipline**: Boosted by Habit quests.
* **Creativity**: Boosted by Creative quests.

### 🏛️ Virtual Reward Shop & Inventory
* Spend quest coins on virtual prestige items:
  * **Profile Themes**: Obsidian Knight, Emerald Ranger, Crimson Vanguard, Solar Paladin.
  * **Guild Badges**: Quest Pioneer, Grand Scholar, Iron Will, Streak Sentinel.
  * **Avatar Relics**: Mystic Runestone, Golden Laurel, Phoenix Feather.
* Complete validation: Prevents negative coin balances, duplicate purchases of unique wares, and client price tampering.
* Equipped items display in real-time on your hero profile and banner.

### 📜 Task History & Audit Trail
* Maintains a permanent record of every completed quest with timestamp, XP earned, coins earned, and category.

---

## 3. Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion)
* **Icons**: Lucide React
* **Backend as a Service (BaaS)**: Firebase Authentication & Cloud Firestore
* **Authoritative Logic**: Cloud Functions (`functions/src/index.ts`) & Atomic Firestore Transactions
* **Build Tool**: Vite 6
* **Deployment Target**: Vercel / Cloud Run / Static Web Hosting

---

## 4. Application Architecture

```
life-rpg/
├── .env.example               # Template for client environment variables
├── firebase-applet-config.json # Auto-provisioned Firebase project configuration
├── firestore.rules            # Firestore security rules enforcing user data isolation
├── firebase-blueprint.json    # Firestore schema specification
├── functions/                 # Authoritative Firebase Cloud Functions
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts           # completeQuest & purchaseReward Cloud Functions
├── src/
│   ├── components/            # UI components (Navbar, XPProgressBar, Modals, Cards)
│   ├── firebase/
│   │   └── config.ts          # Resilient Firebase client initialization
│   ├── hooks/                 # Real-time data hooks (useAuth, useQuests, useInventory, useHistory)
│   ├── pages/                 # Main views (Dashboard, Quests, Rewards, Profile, Auth)
│   ├── services/              # Firestore CRUD & Authoritative RPG operations
│   ├── types/                 # TypeScript interfaces (User, Quest, Attribute, Reward)
│   ├── utils/                 # Level formulas, streak calculators, shop catalog
│   ├── App.tsx                # App state coordinator and routing
│   ├── index.css              # Dark fantasy design tokens & Tailwind base
│   └── main.tsx               # Entry point
├── package.json
└── vite.config.ts
```

---

## 5. Firebase Setup Guide

### Step 1: Create a Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `life-rpg-production`).
3. (Optional) Disable Google Analytics if not needed.

### Step 2: Enable Firebase Authentication
1. In the Firebase console left sidebar, select **Authentication** > **Get Started**.
2. Under the **Sign-in method** tab, click **Email/Password**.
3. Enable the **Email/Password** toggle and click **Save**.

### Step 3: Create Cloud Firestore Database
1. In the Firebase console left sidebar, select **Firestore Database** > **Create database**.
2. Select your preferred database location (e.g., `nam5 (us-central)` or `asia-east1`).
3. Choose **Start in production mode**.
4. Click **Create**.

### Step 4: Deploy Firestore Security Rules
Use the Firebase CLI or paste the contents of `firestore.rules` into the Firebase Console:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### Step 5: (Optional) Deploy Cloud Functions
```bash
cd functions
npm install
npm run deploy
```

---

## 6. Environment Variables

Copy the sample environment file:
```bash
cp .env.example .env
```

Fill in your Firebase credentials from your Web App configuration (already configured in `.env` and `firebase-applet-config.json`):
```env
VITE_FIREBASE_API_KEY="AIzaSyCW4pMMyLGR53OyMc0A8Yx86W6ov1mUUdY"
VITE_FIREBASE_AUTH_DOMAIN="singular-bot-rnn32.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="singular-bot-rnn32"
VITE_FIREBASE_STORAGE_BUCKET="singular-bot-rnn32.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="250377206510"
VITE_FIREBASE_APP_ID="1:250377206510:web:86d6e934d4f7d6e8c311ff"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="ai-studio-03df15a3-3b9c-4364-9e8b-efa2c8f30edb"
```

> **Note on AI Studio**: When running in Google AI Studio Build, the app automatically detects `firebase-applet-config.json` if environment variables are not yet populated!

---

## 7. Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/life-rpg.git
   cd life-rpg
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Verify TypeScript & linting**:
   ```bash
   npm run lint
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 8. Deployment

### Deploying to Vercel
1. Push your code to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
3. Select your `life-rpg` repository.
4. Set the Framework Preset to **Vite**.
5. Under **Environment Variables**, add the `VITE_FIREBASE_*` variables from your `.env` file.
6. Click **Deploy**.

---

## 9. Security & Anti-Cheat Summary

* **Client isolation**: The user can only access their own documents under `/users/{userId}/...`.
* **Zero client XP tampering**: Neither the browser nor user code can pass arbitrary XP, level, coin, streak, or attribute values. All progression is computed based strictly on the verified quest category.
* **Transaction safety**: All quest completions and purchases execute inside atomic transactions, guaranteeing no duplicate completions, race conditions, or negative coin balances.
