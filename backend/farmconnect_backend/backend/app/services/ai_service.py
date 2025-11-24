"""
AI service for chatbot functionality.
"""
from typing import List, Dict
import openai
import google.generativeai as genai
from ..core.config import settings
from ..core.logging import log


class AIService:
    """AI service for handling chat completions."""
    
    FARMING_SYSTEM_PROMPT = """You are an expert agricultural advisor specializing in Indian farming practices. You have deep knowledge of:

- Crop selection and rotation for different Indian regions and seasons
- Soil health management and fertilizer recommendations
- Irrigation techniques and water conservation
- Pest and disease management (both organic and chemical solutions)
- Weather-based farming advice
- Government schemes and subsidies for farmers
- Modern farming techniques and equipment
- Market prices and crop economics
- Organic farming and sustainable practices
- Regional specific crops (wheat, rice, cotton, sugarcane, pulses, vegetables, etc.)

Guidelines:
- Provide practical, actionable advice that Indian farmers can implement
- Consider regional variations (climate, soil type, water availability)
- Suggest cost-effective solutions
- Mention relevant government schemes when applicable
- Use simple language that's easy to understand
- Provide step-by-step instructions when needed
- Include timing recommendations (planting, harvesting, treatment schedules)
- Consider both small-scale and large-scale farming scenarios
- Prioritize sustainable and eco-friendly practices when possible
- Always be supportive and encouraging to farmers

When discussing crops, always mention:
1. Best season for planting
2. Water requirements
3. Common pests and diseases
4. Expected yield
5. Market considerations

Be conversational, helpful, and deeply knowledgeable. Support farmers with confidence and care."""
    
    LANGUAGE_MAP = {
        "hi": "Hindi (Devanagari script)",
        "gu": "Gujarati",
        "en": "English"
    }

    def __init__(self):
        """Initialize AI service."""
        self.provider = settings.AI_PROVIDER
        
        if self.provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API key is required when using OpenAI provider")
            openai.api_key = settings.OPENAI_API_KEY
            self.model_name = settings.OPENAI_MODEL
            log.info(f"Initialized OpenAI with model: {self.model_name}")
            
        elif self.provider == "gemini":
            if not settings.GOOGLE_API_KEY:
                raise ValueError("Google API key is required when using Gemini provider")
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            
            # --- THIS IS THE FIX ---
            # Make sure your .env file has: GEMINI_MODEL=gemini-pro
            # --- END OF FIX ---
            self.model_name = settings.GEMINI_MODEL
            self.model = genai.GenerativeModel(
                self.model_name,
                generation_config=genai.GenerationConfig(
                    temperature=settings.TEMPERATURE,
                    max_output_tokens=settings.MAX_TOKENS,
                )
            )
            log.info(f"Initialized Gemini with model: {self.model_name}")
        
        else:
            raise ValueError(f"Unsupported AI provider: {self.provider}")
    
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        language: str = "en"
    ) -> str:
        """
        Generate AI response based on conversation history.
        """
        try:
            language_name = self.LANGUAGE_MAP.get(language, 'English')
            language_instruction = f"\n\n**CRITICAL RULE:** You MUST respond *only* in the {language_name} language. Do not use any other language."
            
            if self.provider == "openai":
                return await self._generate_openai_response(messages, language_instruction)
            elif self.provider == "gemini":
                # --- THIS IS THE FIX ---
                # We now pass the language_code to the new async function
                # --- END OF FIX ---
                return await self._generate_gemini_response(messages, language_instruction, language)
            
        except Exception as e:
            log.error(f"Error generating AI response: {e}", exc_info=True)
            if "API key" in str(e):
                raise Exception(f"Invalid or missing API Key for {self.provider}. {str(e)}")
            raise
    
    async def _generate_openai_response(
        self,
        messages: List[Dict[str, str]],
        language_instruction: str
    ) -> str:
        """Generate response using OpenAI."""
        formatted_messages = [
            {"role": "system", "content": self.FARMING_SYSTEM_PROMPT + language_instruction}
        ]
        
        for msg in messages:
            formatted_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        response = await client.chat.completions.create(
            model=self.model_name,
            messages=formatted_messages,
            temperature=settings.TEMPERATURE,
            max_tokens=settings.MAX_TOKENS,
        )
        
        return response.choices[0].message.content
    

    # --- THIS IS THE FIXED FUNCTION ---
    # 1. It is now `async def`
    # 2. It builds a proper chat history (`gemini_history`)
    # 3. It uses `await self.model.generate_content_async`
    # ---
    async def _generate_gemini_response(
        self,
        messages: List[Dict[str, str]],
        language_instruction: str,
        language_code: str = "en"
    ) -> str:
        """
        Generate response using Google Gemini with proper chat history.
        This is the new, corrected version.
        """
        
        gemini_history = []
        
        # Add the system prompt as the first 'user' message
        gemini_history.append({
            'role': 'user',
            'parts': [self.FARMING_SYSTEM_PROMPT + language_instruction]
        })
        
        # Add a "model" response to "set the stage"
        if language_code == "gu":
            starter_response = "નમસ્તે! હું તમારી કૃષિ સહાયક છું. કૃપા કરીને તમારો પ્રશ્ન પૂછો."
        elif language_code == "hi":
            starter_response = "नमस्ते! मैं आपका कृषि सहायक हूँ। कृपया अपना प्रश्न पूछें।"
        else:
            starter_response = "Hello! I am your farming assistant. Please ask your question."
            
        gemini_history.append({
            'role': 'model',
            'parts': [starter_response]
        })

        # Add the rest of the conversation history
        for msg in messages:
            role = "model" if msg.get("role") == "assistant" else "user"
            gemini_history.append({
                'role': role,
                'parts': [msg.get("content", "")]
            })

        # Call Gemini API asynchronously
        log.info(f"Sending request to Gemini with {len(gemini_history)} history items.")
        
        response = await self.model.generate_content_async(
            gemini_history
        )
        
        log.info("Received response from Gemini.")
        return response.text


# Create singleton instance
ai_service = AIService()

