<h1 align="center">🛒 NexaCart 2.0 - Next-Gen E-Commerce & Competitor Intelligence Platform</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-NexaCart%202.0-indigo">
  <img src="https://img.shields.io/badge/UI-Fluent%20Acrylic%20Material-cyan">
  <img src="https://img.shields.io/badge/Intelligence-Amazon%20%26%20Flipkart%20Benchmark-emerald">
  <img src="https://img.shields.io/badge/TechStack-MERN-blueviolet">
</p>

<p align="center">
  A state-of-the-art E-Commerce platform engineered with <strong>Fluent Acrylic Design System</strong>, real-time <strong>Market Benchmark Intelligence against Amazon India & Flipkart</strong>, integrated shopping pipeline, and ML-assisted product recommendations.
</p>

<hr>

<h2>🚀 NexaCart 2.0 Architecture & Features</h2>
<ul>
  <li>✨ <strong>Fluent Acrylic Design System:</strong> Clean translucent depth layering, specular highlights, luminous hover feedback, Outfit & Plus Jakarta Sans typography, and high-contrast readability.</li>
  <li>📊 <strong>Admin Competitor Intelligence Hub:</strong>
    <ul>
      <li>Side-by-side Price Comparison across categories & flagship products</li>
      <li>Discount Depth and Net Margin analysis</li>
      <li>Trust Rating vs. Review Pool density matrix</li>
      <li>Geographical Delivery Speed (Metro, Tier-1, Tier-2, Tier-3)</li>
      <li>Interactive 30-Day Historical Price Trends line charts</li>
      <li>2x2 Market Position quadrant (Value Champion Moat)</li>
      <li>Moat & SWOT Analysis with actionable strategic items</li>
      <li>Interactive Dynamic Auto-Repricer & Elasticity Simulator</li>
    </ul>
  </li>
  <li>🛒 <strong>Customer Commerce Pipeline:</strong>
    <ul>
      <li>Omnisearch with real-time predictive matching & competitor beat badges</li>
      <li>Interactive price range slider, min rating filters, and 8 sorting options</li>
      <li>Acrylic Product Cards with instant micro-interaction feedback</li>
      <li>Product Detail Page featuring embedded live Amazon & Flipkart comparison table</li>
      <li>Acrylic Shopping Cart with promo code deductions and competitor savings notice</li>
      <li>2-Step Express Checkout (Address Verification & Payment Gateway with UPI, Card, NetBanking, COD)</li>
      <li>My Orders with real-time delivery milestone telemetry tracking</li>
    </ul>
  </li>
  <li>📦 <strong>Inventory & Order Management:</strong> Live status synchronization and automated Buy-Box undercutting tools.</li>
</ul>

<h2>🛠️ Tech Stack</h2>
<ul>
  <li><strong>Frontend:</strong> React 19, React Router v7, React-Toastify, Fluent Acrylic CSS</li>
  <li><strong>Backend:</strong> Node.js, Express 5.x, MongoDB, Google Auth Library</li>
  <li><strong>Database:</strong> MongoDB Atlas / Local MongoDB</li>
  <li><strong>AI/ML:</strong> Python Flask Recommendation Engine</li>
</ul>

<h2>📂 Project Structure</h2>
<pre>
Smart-ai-ecommerce/
├── NexaCart_2.0_LinkedIn_Demo.mp4   # 1080p Full Demo Video
├── frontend/                        # React 19 Fluent Acrylic SPA
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env.example
├── backend/                         # Node.js Express 5.x Backend
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── ml-backend/                      # Python Flask ML Backend
│   ├── app.py
│   └── requirements.txt
├── api/                             # Serverless API Endpoints
│   └── index.js
├── .gitignore
├── package.json
└── README.md
</pre>

<h2>⚙️ Setup Instructions</h2>

<h3>📦 Backend Setup</h3>
<pre>
cd backend
npm install
node server.js
</pre>

<h3>🌐 Frontend Setup</h3>
<pre>
cd frontend
npm install
npm start
</pre>

<h3>🔐 Google Sign-In Setup</h3>
<ol>
  <li>Create or select a Firebase project, add a Web app, and enable Google under <strong>Authentication → Sign-in method</strong>.</li>
  <li>Add <code>localhost</code> (and your deployed frontend domain) under Firebase Authentication's authorized domains.</li>
  <li>Copy the Firebase Web app configuration into <code>frontend/.env.local</code>:</li>
</ol>
<pre>
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-web-app-id
</pre>
<ol start="4">
  <li>Set <code>GOOGLE_CLIENT_ID</code> in <code>backend/.env</code> to the OAuth 2.0 Web client ID configured for Google sign-in in the same Firebase project.</li>
  <li>Restart both servers after changing environment variables. The backend verifies Google's signed ID token before it creates a user or grants the existing administrator role.</li>
</ol>

<h3>🤖 ML Backend Setup (Python)</h3>
<pre>
cd ml-backend
pip install -r requirements.txt
python app.py
</pre>

<p><strong>Note:</strong> Store MongoDB Atlas URI, Auth0 credentials, and backend API links in respective <code>.env</code> files. Never commit sensitive keys to GitHub.</p>

<h2>🧠 AI Product Recommendations</h2>
<p>
  The recommendation system provides intelligent product suggestions based on:
</p>
<ul>
  <li>User Purchase History</li>
  <li>Category Preferences</li>
  <li>Similar Product Attributes</li>
  <li>Price Range Recommendations</li>
  <li>Trending Popular Items</li>
</ul>
<p>
Fully extendable to integrate advanced ML models using the Python-based <code>ml-backend</code>.
</p>

<h2>🎬 Video Demonstration</h2>
<p>
  A complete 1080p Full HD screen recording walkthrough is included directly in this repository:
</p>
<ul>
  <li><strong>File:</strong> <code>NexaCart_2.0_LinkedIn_Demo.mp4</code> (1080p, 60fps, 1m 24s)</li>
  <li><strong>Demonstrates:</strong> Dual-role authentication, real-time Omnisearch, Amazon India vs. Flipkart price comparison matrix, Fluent Acrylic cart, 2-step express checkout, Google Maps courier dispatch, and the Executive Competitor Intelligence Hub.</li>
</ul>

<h2>💡 Author</h2>
<p>
  Developed by <strong>Asrith Pendyala</strong><br>
  GitHub: <a href="https://github.com/asrith99-bot" target="_blank">@asrith99-bot</a>
</p>

<h2>🔗 Project Repository</h2>
<ul>
  <li><a href="https://github.com/asrith99-bot/Smart-ai-ecommerce" target="_blank">https://github.com/asrith99-bot/Smart-ai-ecommerce</a></li>
</ul>
