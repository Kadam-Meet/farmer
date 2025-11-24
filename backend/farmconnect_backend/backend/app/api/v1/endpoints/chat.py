"""
Chat API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from ....db.base import get_db
from ....models.conversation import Conversation, Message, MessageRole
from ....schemas.conversation import (
    ChatRequest,
    ChatResponse,
    ConversationCreate,
    ConversationResponse,
)
from ....services.ai_service import ai_service
from ....core.logging import log

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Send a chat message and get AI response.
    
    - Creates a new conversation if conversation_id is not provided
    - Stores user message and AI response in database
    - Returns AI-generated farming advice
    """
    try:
        conversation_id = request.conversation_id
        
        # Create or get conversation
        if not conversation_id:
            conversation = Conversation(
                user_id=request.user_id,
                title="Farming Chat",
                language=request.language
            )
            db.add(conversation)
            await db.flush()
            conversation_id = conversation.id
        else:
            # Verify conversation exists
            result = await db.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            conversation = result.scalar_one_or_none()
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )
        
        # Store user message
        user_message = Message(
            conversation_id=conversation_id,
            role=MessageRole.USER,
            content=request.message
        )
        db.add(user_message)
        await db.flush()
        
        # Get conversation history
        result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        messages = result.scalars().all()
        
        # Format messages for AI
        message_history = [
            {"role": msg.role.value, "content": msg.content}
            for msg in messages
        ]
        
        # Generate AI response
        ai_response = await ai_service.generate_response(
            message_history,
            language=request.language
        )
        
        # Store AI response
        assistant_message = Message(
            conversation_id=conversation_id,
            role=MessageRole.ASSISTANT,
            content=ai_response
        )
        db.add(assistant_message)
        await db.commit()
        
        log.info(f"Chat completed for conversation {conversation_id}")
        
        return ChatResponse(
            conversation_id=conversation_id,
            message=ai_response,
            role="assistant",
            created_at=assistant_message.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat: {str(e)}"
        )


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation: ConversationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversation."""
    try:
        new_conversation = Conversation(
            user_id=conversation.user_id,
            title=conversation.title,
            language=conversation.language
        )
        db.add(new_conversation)
        await db.commit()
        await db.refresh(new_conversation)
        
        log.info(f"Created conversation {new_conversation.id}")
        return new_conversation
        
    except Exception as e:
        log.error(f"Error creating conversation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a conversation with its messages."""
    try:
        result = await db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return conversation
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error getting conversation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversation: {str(e)}"
        )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a conversation and all its messages."""
    try:
        result = await db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        await db.delete(conversation)
        await db.commit()
        
        log.info(f"Deleted conversation {conversation_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error deleting conversation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )
