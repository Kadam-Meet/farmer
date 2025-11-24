# Database Setup - Quick Reference

## Required Environment Variables

Your backend needs a `.env` file in the `backend/` directory with these variables:

### ✅ REQUIRED

```env
# Database Connection
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/farmer_chatbot

# Security
SECRET_KEY=your-secret-key-change-this-in-production-make-it-long-and-random
```

### 🔧 Optional (for full functionality)

```env
# AI Provider (choose one)
GOOGLE_API_KEY=your_google_api_key_here
# OR
OPENAI_API_KEY=your_openai_api_key_here
AI_PROVIDER=gemini  # Options: gemini, openai

# Weather API
WEATHER_API_KEY=your_openweather_api_key_here

# Live Mandi Prices
DATA_GOV_IN_API_KEY=your_data_gov_api_key_here
```

## Quick Setup Steps

1. **Create Database**:
   ```bash
   psql -U postgres -c "CREATE DATABASE farmer_chatbot;"
   ```

2. **Update `.env`**:
   - Edit `backend/.env`
   - Replace `YOUR_PASSWORD` with your PostgreSQL password

3. **Run Migrations**:
   ```bash
   cd backend
   alembic upgrade head
   ```

4. **Seed Data (Optional)**:
   ```bash
   cd backend
   python seed_db.py
   ```

5. **Start Everything**:
   ```bash
   npm run dev:full
   ```

## Testing Database Connection

```bash
cd backend
python test_connect.py
```

Expected output: `Database connection successful`

---

**Need help?** See the full [walkthrough.md](file:///c:/Users/bhaut/.gemini/antigravity/brain/32420900-6284-441b-a486-01d08ac47308/walkthrough.md) for detailed instructions.
