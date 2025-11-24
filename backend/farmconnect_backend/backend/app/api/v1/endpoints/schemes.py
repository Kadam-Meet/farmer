"""
Government schemes API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict
from uuid import UUID

from ....db.base import get_db
from ....models.scheme import Scheme
from ....core.logging import log

router = APIRouter()


@router.get("/", response_model=List[Dict])
async def get_schemes(
    language: str = Query(default="en", description="Language code (en, hi, gu)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    active_only: bool = Query(True, description="Show only active schemes"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all government schemes.
    
    - Filter by category and active status (language mapping done in response)
    - Returns schemes ordered by priority
    """
    try:
        query = select(Scheme)
        
        # Temporarily disable to fetch all for debug; re-enable later
        # if active_only:
        #     query = query.where(Scheme.is_active == True)
        
        if category:
            query = query.where(Scheme.category == category)
        
        query = query.order_by(Scheme.priority.desc(), Scheme.created_at.desc())
        
        result = await db.execute(query)
        schemes = result.scalars().all()
        
        # Multilingual mapping with fallback
        lang_map = {
            'en': {'name': 'name_en', 'description': 'description_en', 'eligibility': 'eligibility_en', 'benefits': 'benefits_en'},
            'hi': {'name': 'name_hi', 'description': 'description_hi', 'eligibility': 'eligibility_hi', 'benefits': 'benefits_hi'},
            'gu': {'name': 'name_gu', 'description': 'description_gu', 'eligibility': 'eligibility_gu', 'benefits': 'benefits_gu'},
        }
        map_fields = lang_map.get(language, lang_map['en'])
        
        mapped_schemes = []
        for s in schemes:
            mapped = {
                'id': str(s.id),
                'name': getattr(s, map_fields['name']) or s.name_en,
                'description': getattr(s, map_fields['description']) or s.description_en,
                'eligibility': getattr(s, map_fields['eligibility']) or s.eligibility_en,
                'benefits': getattr(s, map_fields['benefits']) or s.benefits_en,
                'application_url': s.application_url,
                'category': s.category,
                'is_active': s.is_active,
                'priority': s.priority,
                'scheme_metadata': s.scheme_metadata,
                'created_at': s.created_at.isoformat(),
                'updated_at': s.updated_at.isoformat(),
            }
            mapped_schemes.append(mapped)
        
        log.info(f"Fetched {len(mapped_schemes)} schemes for language={language}")
        return mapped_schemes
        
    except Exception as e:
        log.error(f"Error fetching schemes: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch schemes: {str(e)}"
        )


@router.get("/{scheme_id}", response_model=Dict)
async def get_scheme(
    scheme_id: UUID,
    language: str = Query(default="en", description="Language code (en, hi, gu)"),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific scheme by ID."""
    try:
        result = await db.execute(
            select(Scheme).where(Scheme.id == scheme_id)
        )
        scheme = result.scalar_one_or_none()
        
        if not scheme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scheme not found"
            )
        
        # Multilingual mapping
        lang_map = {
            'en': {'name': 'name_en', 'description': 'description_en', 'eligibility': 'eligibility_en', 'benefits': 'benefits_en'},
            'hi': {'name': 'name_hi', 'description': 'description_hi', 'eligibility': 'eligibility_hi', 'benefits': 'benefits_hi'},
            'gu': {'name': 'name_gu', 'description': 'description_gu', 'eligibility': 'eligibility_gu', 'benefits': 'benefits_gu'},
        }
        map_fields = lang_map.get(language, lang_map['en'])
        
        mapped = {
            'id': str(scheme.id),
            'name': getattr(scheme, map_fields['name']) or scheme.name_en,
            'description': getattr(scheme, map_fields['description']) or scheme.description_en,
            'eligibility': getattr(scheme, map_fields['eligibility']) or scheme.eligibility_en,
            'benefits': getattr(scheme, map_fields['benefits']) or scheme.benefits_en,
            'application_url': scheme.application_url,
            'category': scheme.category,
            'is_active': scheme.is_active,
            'priority': scheme.priority,
            'scheme_metadata': scheme.scheme_metadata,
            'created_at': scheme.created_at.isoformat(),
            'updated_at': scheme.updated_at.isoformat(),
        }
        
        return mapped
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error fetching scheme: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch scheme: {str(e)}"
        )


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_scheme(
    scheme_data: Dict,  # Dict for input—no Pydantic schema
    db: AsyncSession = Depends(get_db)
):
    """Create a new government scheme."""
    try:
        new_scheme = Scheme(**scheme_data)
        db.add(new_scheme)
        await db.commit()
        await db.refresh(new_scheme)
        
        log.info(f"Created scheme {new_scheme.id}: {new_scheme.name_en}")
        return {
            'id': str(new_scheme.id),
            'name': new_scheme.name_en,
            'description': new_scheme.description_en,
            'created_at': new_scheme.created_at.isoformat(),
        }
        
    except Exception as e:
        log.error(f"Error creating scheme: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create scheme: {str(e)}"
        )


@router.patch("/{scheme_id}", response_model=Dict)
async def update_scheme(
    scheme_id: UUID,
    scheme_update: Dict,  # Dict for input—no Pydantic schema
    db: AsyncSession = Depends(get_db)
):
    """Update an existing scheme."""
    try:
        result = await db.execute(
            select(Scheme).where(Scheme.id == scheme_id)
        )
        scheme = result.scalar_one_or_none()
        
        if not scheme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scheme not found"
            )
        
        # Update fields
        for field, value in scheme_update.items():
            setattr(scheme, field, value)
        
        await db.commit()
        await db.refresh(scheme)
        
        log.info(f"Updated scheme {scheme_id}")
        return {
            'id': str(scheme.id),
            'name': scheme.name_en,
            'updated_at': scheme.updated_at.isoformat(),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error updating scheme: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update scheme: {str(e)}"
        )


@router.delete("/{scheme_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scheme(
    scheme_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a scheme."""
    try:
        result = await db.execute(
            select(Scheme).where(Scheme.id == scheme_id)
        )
        scheme = result.scalar_one_or_none()
        
        if not scheme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scheme not found"
            )
        
        await db.delete(scheme)
        await db.commit()
        
        log.info(f"Deleted scheme {scheme_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error deleting scheme: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete scheme: {str(e)}"
        )