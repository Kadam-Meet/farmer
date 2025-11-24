import React from 'react';
import { Calendar, BookOpen, DollarSign, Lightbulb } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

const NewsSection: React.FC = () => {
  const { language } = useApp();

  const mockNews = [
    {
      id: '1',
      title: language === 'hi' ? 'नई कृषि सब्सिडी योजना 2025' : 
             language === 'gu' ? 'નવી કૃષિ સબસિડી યોજના 2025' :
             'New Agricultural Subsidy Scheme 2025',
      content: language === 'hi' ? 'सरकार ने किसानों के लिए नई सब्सिडी योजना की घोषणा की है...' :
               language === 'gu' ? 'સરકારે ખેડૂતો માટે નવી સબસિડી યોજનાની જાહેરાત કરી છે...' :
               'Government announces new subsidy scheme for farmers with enhanced benefits...',
      category: 'subsidy',
      publishedAt: new Date('2025-01-15'),
      imageUrl: 'https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    },
    {
      id: '2',
      title: language === 'hi' ? 'जैविक खेती की नई तकनीक' : 
             language === 'gu' ? 'જૈવિક ખેતીની નવી તકનીક' :
             'New Techniques in Organic Farming',
      content: language === 'hi' ? 'जानें कैसे जैविक खेती से अधिक मुनाफा कमाया जा सकता है...' :
               language === 'gu' ? 'જાણો કેવી રીતે જૈવિક ખેતીથી વધુ નફો કમાવી શકાય...' :
               'Learn how to maximize profits through organic farming techniques...',
      category: 'education',
      publishedAt: new Date('2025-01-14'),
      imageUrl: 'https://images.pexels.com/photos/1415554/pexels-photo-1415554.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    },
    {
      id: '3',
      title: language === 'hi' ? 'ड्रोन तकनीक कृषि में क्रांति' : 
             language === 'gu' ? 'ડ્રોન ટેક્નોલોજી કૃષિમાં ક્રાંતિ' :
             'Drone Technology Revolutionizing Agriculture',
      content: language === 'hi' ? 'कृषि में ड्रोन का उपयोग कैसे बदल रहा है खेती का तरीका...' :
               language === 'gu' ? 'કૃષિમાં ડ્રોનનો ઉપયોગ કેવી રીતે ખેતીની રીત બદલી રહી છે...' :
               'How drone technology is transforming modern farming practices...',
      category: 'technology',
      publishedAt: new Date('2025-01-13'),
      imageUrl: 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    },
    {
      id: '4',
      title: language === 'hi' ? 'किसान क्रेडिट कार्ड अपडेट' : 
             language === 'gu' ? 'કિસાન ક્રેડિટ કાર્ડ અપડેટ' :
             'Kisan Credit Card Updates',
      content: language === 'hi' ? 'किसान क्रेडिट कार्ड में नई सुविधाएं और बेहतर ब्याज दरें...' :
               language === 'gu' ? 'કિસાન ક્રેડિટ કાર્ડમાં નવી સુવિધાઓ અને બહેતર વ્યાજ દરો...' :
               'New features and better interest rates for Kisan Credit Cards...',
      category: 'news',
      publishedAt: new Date('2025-01-12'),
      imageUrl: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'subsidy':
        return <DollarSign size={16} className="text-green-600" />;
      case 'education':
        return <BookOpen size={16} className="text-blue-600" />;
      case 'technology':
        return <Lightbulb size={16} className="text-yellow-600" />;
      default:
        return <Calendar size={16} className="text-gray-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'subsidy':
        return language === 'hi' ? 'सब्सिडी' : language === 'gu' ? 'સબસિડી' : 'Subsidy';
      case 'education':
        return language === 'hi' ? 'शिक्षा' : language === 'gu' ? 'શિક્ષણ' : 'Education';
      case 'technology':
        return language === 'hi' ? 'तकनीक' : language === 'gu' ? 'ટેક્નોલોજી' : 'Technology';
      default:
        return language === 'hi' ? 'समाचार' : language === 'gu' ? 'સમાચાર' : 'News';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(
      language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN',
      { year: 'numeric', month: 'long', day: 'numeric' }
    ).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {getTranslation('news', language)}
        </h2>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'subsidy', 'education', 'technology', 'news'].map((category) => (
          <button
            key={category}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            {category === 'all' 
              ? (language === 'hi' ? 'सभी' : language === 'gu' ? 'બધું' : 'All')
              : getCategoryLabel(category)
            }
          </button>
        ))}
      </div>

      {/* News Articles */}
      <div className="grid lg:grid-cols-2 gap-6">
        {mockNews.map((article) => (
          <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-200">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(article.category)}
                  <span className="text-sm font-medium text-gray-600">
                    {getCategoryLabel(article.category)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.content}
              </p>
              
              <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
                {language === 'hi' ? 'और पढ़ें' : language === 'gu' ? 'વધુ વાંચો' : 'Read More'}
                <span className="ml-1">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="bg-green-100 hover:bg-green-200 text-green-700 px-6 py-3 rounded-lg font-medium transition-colors">
          {language === 'hi' ? 'और समाचार लोड करें' : 
           language === 'gu' ? 'વધુ સમાચાર લોડ કરો' : 
           'Load More News'}
        </button>
      </div>
    </div>
  );
};

// Helper function to get translation (if not already imported)
const getTranslation = (key: string, lang: string) => {
  const translations: any = {
    news: {
      en: 'News & Education',
      hi: 'समाचार और शिक्षा',
      gu: 'સમાચાર અને શિક્ષણ'
    }
  };
  
  return translations[key]?.[lang] || translations[key]?.en || key;
};

export default NewsSection;