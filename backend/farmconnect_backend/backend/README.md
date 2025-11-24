# 🌾 Farmer Chatbot API

A comprehensive, scalable FastAPI backend for an AI-powered farmer chatbot application with multilingual support (English, Hindi, Gujarati).

## 🚀 Features

- **🤖 AI Chat**: Intelligent farming assistant using OpenAI GPT or Google Gemini
- **🌦️ Weather**: Real-time weather data and alerts with OpenWeatherMap integration
- **📋 Government Schemes**: CRUD operations for agricultural schemes
- **💡 Farming Tips**: Seasonal and category-based farming advice
- **🌍 Multilingual**: Support for English, Hindi, and Gujarati
- **⚡ High Performance**: Async/await, connection pooling, Redis caching
- **🔒 Production Ready**: Error handling, logging, rate limiting, CORS
- **📚 Auto Documentation**: Interactive API docs with Swagger UI

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis (optional, for caching)
- OpenAI API key OR Google AI API key
- OpenWeatherMap API key (optional)

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/farmer_chatbot

# AI Provider (choose one)
AI_PROVIDER=gemini  # or openai
GOOGLE_API_KEY=your_google_api_key
# OPENAI_API_KEY=your_openai_api_key

# Weather (optional)
WEATHER_API_KEY=your_openweather_api_key

# Security
SECRET_KEY=your-secret-key-change-this
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb farmer_chatbot

# Initialize database (creates tables)
# Tables are auto-created on app startup

# Seed initial data
python seed_db.py
```

## 🚀 Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or using Python:

```bash
python -m app.main
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker

```bash
# Start all services (API, PostgreSQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## 📖 API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔌 API Endpoints

### Chat

- `POST /api/v1/chat/chat` - Send message and get AI response
- `POST /api/v1/chat/conversations` - Create new conversation
- `GET /api/v1/chat/conversations/{id}` - Get conversation with messages
- `DELETE /api/v1/chat/conversations/{id}` - Delete conversation

### Weather

- `POST /api/v1/weather/alerts` - Get weather alerts for location
- `GET /api/v1/weather/current` - Get current weather
- `GET /api/v1/weather/forecast` - Get weather forecast

### Schemes

- `GET /api/v1/schemes/` - List all schemes (with filters)
- `GET /api/v1/schemes/{id}` - Get specific scheme
- `POST /api/v1/schemes/` - Create new scheme
- `PATCH /api/v1/schemes/{id}` - Update scheme
- `DELETE /api/v1/schemes/{id}` - Delete scheme

### Tips

- `GET /api/v1/tips/` - List all tips (with filters)
- `GET /api/v1/tips/{id}` - Get specific tip
- `POST /api/v1/tips/` - Create new tip
- `PATCH /api/v1/tips/{id}` - Update tip
- `DELETE /api/v1/tips/{id}` - Delete tip

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── chat.py
│   │           ├── weather.py
│   │           ├── schemes.py
│   │           └── tips.py
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   ├── db/
│   │   ├── base.py
│   │   └── seed_data.py
│   ├── middleware/
│   │   ├── cors.py
│   │   └── error_handler.py
│   ├── models/
│   │   ├── conversation.py
│   │   ├── scheme.py
│   │   ├── tip.py
│   │   └── weather.py
│   ├── schemas/
│   │   ├── conversation.py
│   │   ├── scheme.py
│   │   ├── tip.py
│   │   └── weather.py
│   ├── services/
│   │   ├── ai_service.py
│   │   └── weather_service.py
│   └── main.py
├── logs/
├── .env
├── .env.example
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🧪 Testing

Example curl requests:

### Chat Request

```bash
curl -X POST "http://localhost:8000/api/v1/chat/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the best time to plant wheat?",
    "language": "en",
    "user_id": "demo-user"
  }'
```

### Weather Alerts

```bash
curl -X POST "http://localhost:8000/api/v1/weather/alerts" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Delhi,IN",
    "language": "en"
  }'
```

### Get Schemes

```bash
curl "http://localhost:8000/api/v1/schemes/?language=en&active_only=true"
```

## 🔧 Configuration

### AI Provider Setup

**For Google Gemini** (Free tier available):
1. Get API key from https://makersuite.google.com/app/apikey
2. Set `AI_PROVIDER=gemini` in `.env`
3. Set `GOOGLE_API_KEY=your_key`

**For OpenAI**:
1. Get API key from https://platform.openai.com/api-keys
2. Set `AI_PROVIDER=openai` in `.env`
3. Set `OPENAI_API_KEY=your_key`

### Weather API Setup

1. Sign up at https://openweathermap.org/api
2. Get free API key
3. Set `WEATHER_API_KEY=your_key` in `.env`

## 🚀 Deployment

### Using Docker (Recommended)

```bash
docker-compose up -d
```

### Manual Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Install dependencies
4. Run with gunicorn/uvicorn

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## 🔐 Security Notes

- Always change `SECRET_KEY` in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting for public APIs
- Use PostgreSQL user with minimal permissions

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for Indian Farmers**
