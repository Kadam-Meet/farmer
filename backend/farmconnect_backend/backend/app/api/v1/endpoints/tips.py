"""
Farming tips API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional, Dict
from uuid import UUID

from ....db.base import get_db
from ....models.tip import Tip
from ....core.logging import log

router = APIRouter()


@router.get("/", response_model=List[Dict])  # Dict to avoid serialization issues
async def get_tips(
    language: str = Query(default="en", description="Language code (en, hi, gu)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    season: Optional[str] = Query(None, description="Filter by season"),
    active_only: bool = Query(True, description="Show only active tips"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all farming tips.
    
    - Filter by category, season, and active status (language mapping done in response)
    - Returns tips ordered by priority
    """
    try:
        query = select(Tip)
        
        if active_only:
            query = query.where(Tip.is_active == True)
        
        if category:
            query = query.where(Tip.category == category)
        
        # --- THIS IS THE FIX ---
        # We only apply the season filter if 'season' is provided AND it is not "all".
        # If 'season' is "all", we want to return all tips, so we add no filter.
        if season and season != "all":
            # This finds tips for the specific season (e.g., 'winter') 
            # OR tips that apply to 'all' seasons.
            query = query.where(or_(Tip.season == season, Tip.season == "all"))
        
        query = query.order_by(Tip.priority.desc(), Tip.created_at.desc())
        
        result = await db.execute(query)
        tips = result.scalars().all()
        
        # Multilingual mapping (select language-specific fields, fallback to 'en')
        lang_map = {
            'en': {'title': 'title_en', 'description': 'description_en', 'content': 'content_en'},
            'hi': {'title': 'title_hi', 'description': 'description_hi', 'content': 'content_hi'},
            'gu': {'title': 'title_gu', 'description': 'description_gu', 'content': 'content_gu'},
        }
        map_fields = lang_map.get(language, lang_map['en'])
        
        mapped_tips = []
        for t in tips:
            mapped = {
                'id': str(t.id),
                'title': getattr(t, map_fields['title']) or t.title_en,
                'description': getattr(t, map_fields['description']) or t.description_en,
                'content': getattr(t, map_fields['content']) or t.content_en,
                'category': t.category,
                'icon': t.icon,
                'season': t.season,
                'is_active': t.is_active,
                'priority': t.priority,
                'tip_metadata': t.tip_metadata,
                'created_at': t.created_at.isoformat(),
                'updated_at': t.updated_at.isoformat(),
            }
            mapped_tips.append(mapped)
        
        log.info(f"Fetched {len(mapped_tips)} tips for language={language}")
        return mapped_tips
        
    except Exception as e:
        log.error(f"Error fetching tips: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tips: {str(e)}"
        )


@router.get("/{tip_id}", response_model=Dict)  # Dict for consistency
async def get_tip(
    tip_id: UUID,
    language: str = Query(default="en", description="Language code (en, hi, gu)"),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific tip by ID."""
    try:
        result = await db.execute(
            select(Tip).where(Tip.id == tip_id)
        )
        tip = result.scalar_one_or_none()
        
        if not tip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tip not found"
            )
        
        # Multilingual mapping
        lang_map = {
            'en': {'title': 'title_en', 'description': 'description_en', 'content': 'content_en'},
            'hi': {'title': 'title_hi', 'description': 'description_hi', 'content': 'content_hi'},
            'gu': {'title': 'title_gu', 'description': 'description_gu', 'content': 'content_gu'},
        }
        map_fields = lang_map.get(language, lang_map['en'])
        
        mapped = {
            'id': str(tip.id),
            'title': getattr(tip, map_fields['title']) or tip.title_en,
            'description': getattr(tip, map_fields['description']) or tip.description_en,
            'content': getattr(tip, map_fields['content']) or tip.content_en,
            'category': tip.category,
            'icon': tip.icon,
            'season': tip.season,
            'is_active': tip.is_active,
            'priority': tip.priority,
            'tip_metadata': tip.tip_metadata,
            'created_at': tip.created_at.isoformat(),
            'updated_at': tip.updated_at.isoformat(),
        }
        
        return mapped
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error fetching tip: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tip: {str(e)}"
        )


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_tip(
    tip_data: Dict,  # Dict for input—no Pydantic schema
    db: AsyncSession = Depends(get_db)
):
    """Create a new farming tip."""
    try:
        new_tip = Tip(**tip_data)
        db.add(new_tip)
        await db.commit()
        await db.refresh(new_tip)
        
        log.info(f"Created tip {new_tip.id}: {new_tip.title_en}")
        return {
            'id': str(new_tip.id),
            'title': new_tip.title_en,
            'created_at': new_tip.created_at.isoformat(),
        }
        
    except Exception as e:
        log.error(f"Error creating tip: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create tip: {str(e)}"
        )


@router.patch("/{tip_id}", response_model=Dict)
async def update_tip(
    tip_id: UUID,
    tip_update: Dict,  # Dict for input—no Pydantic schema
    db: AsyncSession = Depends(get_db)
):
    """Update an existing tip."""
    try:
        result = await db.execute(
            select(Tip).where(Tip.id == tip_id)
        )
        tip = result.scalar_one_or_none()
        
        if not tip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tip not found"
            )
        
        # Update fields
        for field, value in tip_update.items():
            setattr(tip, field, value)
        
        await db.commit()
        await db.refresh(tip)
        
        log.info(f"Updated tip {tip_id}")
        return {
            'id': str(tip.id),
            'title': tip.title_en,
            'updated_at': tip.updated_at.isoformat(),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error updating tip: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update tip: {str(e)}"
        )


@router.delete("/{tip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tip(
    tip_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a tip."""
    try:
        result = await db.execute(
            select(Tip).where(Tip.id == tip_id)
        )
        tip = result.scalar_one_or_none()
        
        if not tip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tip not found"
            )
        
        await db.delete(tip)
        await db.commit()
        
        log.info(f"Deleted tip {tip_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error deleting tip: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete tip: {str(e)}"
        )
