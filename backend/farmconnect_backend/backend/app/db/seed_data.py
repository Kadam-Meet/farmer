"""
Database seed data for initial setup.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.scheme import Scheme
from ..models.tip import Tip
from ..core.logging import log


async def seed_schemes(db: AsyncSession):
    """Seed government schemes."""
    schemes_data = [
        {
            "name_en": "PM-KISAN",
            "name_hi": "पीएम-किसान",
            "name_gu": "પીએમ-કિસાન",
            "description_en": "Direct income support of ₹6,000 per year to farmer families. Three installments of ₹2,000 each.",
            "description_hi": "किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता। ₹2,000 की तीन किस्तें。",
            "description_gu": "ખેડૂત પરિવારોને દર વર્ષે ₹6,000 ની સીધી આવક સહાય. ₹2,000 ની ત્રણ હપ્તા.",
            "category": "subsidy",
            "application_url": "https://pmkisan.gov.in/",
            "priority": 10,
            "is_active": True
        },
        {
            "name_en": "Soil Health Card Scheme",
            "name_hi": "मृदा स्वास्थ्य कार्ड योजना",
            "name_gu": "માટી આરોગ્ય કાર્ડ યોજના",
            "description_en": "Free soil testing to help farmers improve productivity through balanced use of fertilizers.",
            "description_hi": "उर्वरकों के संतुलित उपयोग के माध्यम से किसानों को उत्पादकता में सुधार करने में मदद के लिए मुफ्त मिट्टी परीक्षण।",
            "description_gu": "ખાતરના સંતુલિત ઉપયોગ દ્વારા ખેડૂતોને ઉત્પાદકતા સુધારવામાં મદદ કરવા માટે મફત માટી પરીક્ષણ.",
            "category": "support",
            "application_url": "https://soilhealth.dac.gov.in/",
            "priority": 9,
            "is_active": True
        },
        {
            "name_en": "Pradhan Mantri Fasal Bima Yojana",
            "name_hi": "प्रधानमंत्री फसल बीमा योजना",
            "name_gu": "પ્રધાનમંત્રી ફસલ વીમા યોજના",
            "description_en": "Crop insurance scheme providing financial support against crop loss due to natural calamities.",
            "description_hi": "प्राकृतिक आपदाओं के कारण फसल नुकसान के खिलाफ वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना。",
            "description_gu": "કુદરતી આફતોને કારણે પાકના નુકસાન સામે નાણાકીય સહાય પૂરી પાડતી પાક વીમા યોજના.",
            "category": "insurance",
            "application_url": "https://pmfby.gov.in/",
            "priority": 10,
            "is_active": True
        },
        {
            "name_en": "Kisan Credit Card",
            "name_hi": "किसान क्रेडिट कार्ड",
            "name_gu": "કિસાન ક્રેડિટ કાર્ડ",
            "description_en": "Short-term credit facility for farmers to meet crop production needs at subsidized interest rates.",
            "description_hi": "सब्सिडी वाली ब्याज दरों पर फसल उत्पादन की जरूरतों को पूरा करने के लिए किसानों के लिए अल्पकालिक ऋण सुविधा।",
            "description_gu": "સબસિડીવાળા વ્યાજ દરે પાક ઉત્પાદન જરૂરિયાતો પૂરી કરવા માટે ખેડૂતો માટે ટૂંકા ગાળાની ધિરાણ સુવિધા.",
            "category": "loan",
            "priority": 8,
            "is_active": True
        },
    ]
    
    for scheme_data in schemes_data:
        scheme = Scheme(**scheme_data)
        db.add(scheme)
    
    await db.commit()
    log.info(f"Seeded {len(schemes_data)} schemes")


async def seed_tips(db: AsyncSession):
    """Seed farming tips."""
    tips_data = [
        {
            "title_en": "Crop Rotation",
            "title_hi": "फसल चक्र",
            "title_gu": "પાક પરિભ્રમણ",
            "description_en": "Improve soil health by rotating crops each season.",
            "description_hi": "प्रत्येक मौसम में फसलों को घुमाकर मिट्टी के स्वास्थ्य में सुधार करें।",
            "description_gu": "દરેક મોસમમાં પાકોને ફેરવીને જમીનના સ્વાસ્થ્યમાં સુધારો કરો.",
            "content_en": "Crop rotation is a time-tested practice that helps maintain soil fertility, reduce pest pressure, and increase yields. Rotate between legumes, cereals, and vegetables to balance nutrient uptake.",
            "content_hi": "फसल चक्र एक समय-परीक्षित प्रथा है जो मिट्टी की उर्वरता बनाए रखने, कीट दबाव को कम करने और पैदावार बढ़ाने में मदद करती है। पोषक तत्वों के संतुलन के लिए फलियों, अनाज और सब्जियों के बीच बदलाव करें。",
            "content_gu": "પાક પરિભ્રમણ એ સમય-પરીક્ષિત પ્રથા છે જે જમીનની ફળદ્રુપતા જાળવવામાં, જીવાતના દબાણને ઘટાડવામાં અને ઉપજ વધારવામાં મદદ કરે છે.",
            "category": "crop_management",
            "icon": "Sprout",
            "season": "all",
            "priority": 10,
            "is_active": True
        },
        {
            "title_en": "Wheat Sowing",
            "title_hi": "गेहूं की बुवाई",
            "title_gu": "ઘઉંની વાવણી",
            "description_en": "Best practices for winter wheat cultivation and timing.",
            "description_hi": "सर्दियों में गेहूं की खेती और समय के लिए सर्वोत्तम प्रथाएं。",
            "description_gu": "શિયાળુ ઘઉંની ખેતી અને સમય માટે શ્રેષ્ઠ પ્રથાઓ.",
            "content_en": "Sow wheat between November 1-20 for optimal yields. Use certified seeds at 100 kg/hectare. Ensure proper soil moisture and apply pre-sowing irrigation if needed.",
            "content_hi": "इष्टतम पैदावार के लिए 1-20 नवंबर के बीच गेहूं की बुवाई करें। 100 किलोग्राम/हेक्टेयर की दर से प्रमाणित बीज का उपयोग करें。",
            "content_gu": "શ્રેષ્ઠ ઉપજ માટે નવેમ્બર 1-20 વચ્ચે ઘઉં વાવો. 100 કિગ્રા/હેક્ટર પ્રમાણિત બીજનો ઉપયોગ કરો.",
            "category": "crop_management",
            "icon": "Wheat",
            "season": "winter",
            "priority": 9,
            "is_active": True
        },
        {
            "title_en": "Irrigation Tips",
            "title_hi": "सिंचाई टिप्स",
            "title_gu": "સિંચાઈ ટીપ્સ",
            "description_en": "Efficient water management for better yields.",
            "description_hi": "बेहतर उपज के लिए कुशल जल प्रबंधन।",
            "description_gu": "વધુ સારી ઉપજ માટે કાર્યક્ષમ પાણી વ્યવસ્થાપન.",
            "content_en": "Use drip irrigation to save up to 60% water. Water crops early morning or evening. Monitor soil moisture regularly. Mulching helps retain moisture.",
            "content_hi": "60% तक पानी बचाने के लिए ड्रिप सिंचाई का उपयोग करें। सुबह जल्दी या शाम को फसलों को पानी दें।",
            "content_gu": "60% સુધી પાણી બચાવવા માટે ટપક સિંચાઈનો ઉપયોગ કરો. વહેલી સવારે અથવા સાંજે પાકોને પાણી આપો.",
            "category": "irrigation",
            "icon": "Droplets",
            "season": "all",
            "priority": 10,
            "is_active": True
        },
        {
            "title_en": "Pest Control",
            "title_hi": "कीट नियंत्रण",
            "title_gu": "જીવાત નિયંત્રણ",
            "description_en": "Natural and organic pest management techniques.",
            "description_hi": "प्राकृतिक और जैविक कीट प्रबंधन तकनीक।",
            "description_gu": "કુદરતી અને કાર્બનિક જીવાત વ્યવસ્થાપન તકનીકો.",
            "content_en": "Use neem oil spray for natural pest control. Practice companion planting. Introduce beneficial insects like ladybugs. Monitor crops regularly for early detection.",
            "content_hi": "प्राकृतिक कीट नियंत्रण के लिए नीम के तेल के स्प्रे का उपयोग करें। साथी रोपण का अभ्यास करें。",
            "content_gu": "કુદરતી જીવાત નિયંત્રણ માટે લીમડાના તેલના સ્પ્રેનો ઉપયોગ કરો.",
            "category": "pest_control",
            "icon": "Bug",
            "season": "all",
            "priority": 9,
            "is_active": True
        },
    ]
    
    for tip_data in tips_data:
        tip = Tip(**tip_data)
        db.add(tip)
    
    await db.commit()
    log.info(f"Seeded {len(tips_data)} tips")


async def seed_all(db: AsyncSession):
    """Seed all initial data."""
    log.info("Starting database seeding...")
    await seed_schemes(db)
    await seed_tips(db)
    log.info("Database seeding completed!")