# EcoSpend AI 🪙🌱

**EcoSpend AI** is a premium, AI-powered full-stack personal finance tracker that encourages carbon-conscious spending. It empowers users to monitor their monthly transactions, analyze their financial and carbon footprints, receive customized green alternatives, compete in sustainability challenges, and earn certificates for outstanding environmental stewardship.

---

## 🌟 Features

### 1. Interactive Eco-Dashboard
- **Receipt Parsing**: Upload receipt images to extract and log transactions automatically.
- **Quick Logging**: Log expenses manually or use quick categories.
- **Eco Metrics**: View real-time tracking of carbon offset (in kg of $CO_2$) and money saved through sustainable alternatives.

### 2. AI Eco-Advisor (Gemini Powered)
- Chat with a personalized AI assistant that analyzes your spending history.
- Get actionable budgeting advice and cost-reducing, eco-friendly product alternatives.

### 3. Rich Analytics & Data Visualization
- Interactive spending-vs-carbon charts powered by **Recharts**.
- Category-wise analysis highlighting where you spend the most and how to optimize both budget and environmental impact.

### 4. Leaderboard, Challenges & Streaks
- Compete on the community leaderboard with weekly eco-scores.
- Join sustainability challenges (e.g., "Zero-Waste Week", "Public Transit Commuter") and check off tasks.
- Keep up a daily login streak to earn extra Eco Points.

### 5. Green Marketplace
- Earn **Eco Points** through green purchases and challenge check-ins.
- Redeem points in the marketplace for eco-friendly goods, solar chargers, and zero-waste items.

### 6. Sustainability Certificates
- Automatically generate and download a custom, dynamically formatted PDF certificate showing your stewardship tier (Bronze, Silver, Gold).
- Tracks total carbon offset, eco-points, and financial savings in a premium layout.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (Charts), Lucide React (Icons)
- **Effects**: Canvas Confetti (Gamified successes)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Token (JWT) secured via HttpOnly cookies
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **PDF Engine**: PDFKit

---

## 📂 Project Structure

```text
EcoSpendAI/
├── backend/
│   ├── config/             # Database connection configurations
│   ├── controllers/        # Route controllers (Auth, Expenses, Reports)
│   ├── middleware/         # Auth verification and file upload middlewares
│   ├── models/             # Mongoose database schemas (User, Expense, Category)
│   ├── routes/             # Express API routes
│   ├── utils/              # Helper utilities (Gemini API, PDF Generator)
│   ├── server.js           # Express app entry point
│   └── package.json        # Backend scripts & dependencies
│
└── frontend/
    ├── src/
    │   ├── components/     # UI Pages (Dashboard, Analytics, Leaderboard, etc.)
    │   ├── context/        # React Contexts (Auth and Theme state management)
    │   ├── App.jsx         # View router and layout assembly
    │   ├── index.css       # Core Tailwind styling tokens
    │   └── main.jsx        # App mounting point
    ├── index.html          # HTML Shell
    ├── vite.config.js      # Dev server configurations & API Proxy
    └── package.json        # Frontend scripts & dependencies
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas Uri)
- Google Gemini API Key

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/EcoSpendAI.git
cd EcoSpendAI
```

### Step 2: Configure Backend
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:3000
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```

### Step 3: Configure Frontend
1. Open a new terminal, navigate to the frontend directory, and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`.

---

## ☁️ Deployment Guidelines

You can deploy the frontend on **Vercel** and the backend on **Render**.

### 1. Backend Deployment (Render)
1. Sign in to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the following service settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `your_mongodb_connection_string`
   - `JWT_SECRET`: `your_secure_jwt_secret`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `FRONTEND_URL`: `https://your-frontend-vercel-url.vercel.app` (update this once your frontend is live)
5. Deploy and copy the generated Render service URL (e.g., `https://ecospend-backend.onrender.com`).

### 2. Frontend Deployment (Vercel)
1. In `frontend/vercel.json`, verify or update the proxy destination with your Render backend URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-backend-url.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
2. Commit and push the `vercel.json` file to GitHub.
3. Sign in to [Vercel](https://vercel.com) and import your repository.
4. Set the **Root Directory** to `frontend`.
5. Under **Build & Development Settings**, Vercel will automatically detect Vite. Keep:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Once the Vercel site is live, copy its domain and add it as the `FRONTEND_URL` environment variable in your Render backend settings.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/EcoSpendAI/issues).

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
