import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, type MandiPrice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MandiSectionProps {
  language: "en" | "hi" | "gu";
}

const translationsData = {
  en: {
    title: "Live Mandi Prices",
    commodity: "Select Commodity",
    market: "Market",
    price: "Price (₹/Qtl.)",
    min: "Min",
    max: "Max",
    modal: "Modal",
    noData: "No data available for this commodity. Try another one.",
    error: "Failed to fetch market prices.",
    loading: "Loading prices...",
    refresh: "Refresh",
    refreshSuccess: "Prices refreshed successfully",
  },
  hi: {
    title: "लाइव मंडी भाव",
    commodity: "फसल चुनें",
    market: "मंडी",
    price: "मूल्य (₹/क्विंटल)",
    min: "न्यूनतम",
    max: "अधिकतम",
    modal: "औसत",
    noData: "इस फसल के लिए कोई डेटा उपलब्ध नहीं है। दूसरी फसल चुनें।",
    error: "बाजार मूल्य लाने में विफल।",
    loading: "कीमतें लोड हो रही हैं...",
    refresh: "रिफ्रेश",
    refreshSuccess: "कीमतें सफलतापूर्वक रिफ्रेश की गईं",
  },
  gu: {
    title: "લાઇવ મંડી ભાવ",
    commodity: "પાક પસંદ કરો",
    market: "માર્કેટ",
    price: "કિંમત (₹/ક્વિન્ટલ)",
    min: "ન્યૂનતમ",
    max: "મહત્તમ",
    modal: "સરેરાશ",
    noData: "આ પાક માટે કોઈ ડેટા ઉપલબ્ધ નથી. બીજો પાક અજમાવો.",
    error: "બજાર ભાવ મેળવવામાં નિષ્ફળ.",
    loading: "કિંમતો લોડ થઈ રહી છે...",
    refresh: "રિફ્રેશ કરો",
    refreshSuccess: "કિંમતો સફળતાપૂર્વક રિફ્રેશ થઈ",
  },
};

// Commodities that are commonly traded
const commodities = [
  { value: "Wheat", label: "Wheat / गेहूं / ઘઉં" },
  { value: "Rice", label: "Rice / चावल / ચોખા" },
  { value: "Bajra", label: "Bajra / बाजरा / બાજરી" },
  { value: "Maize", label: "Maize / मक्का / મકાઈ" },
  { value: "Cotton", label: "Cotton / कपास / કપાસ" },
  { value: "Groundnut", label: "Groundnut / मूंगफली / મગફળી" },
  { value: "Castor Seed", label: "Castor Seed / अरंडी / એરંડા" },
  { value: "Onion", label: "Onion / प्याज / ડુંગળી" },
  { value: "Potato", label: "Potato / आलू / બટાકા" },
  { value: "Tomato", label: "Tomato / टमाटर / ટામેટા" },
  { value: "Cumin", label: "Cumin / जीरा / જીરૂ" },
  { value: "Garlic", label: "Garlic / लहसुन / લસણ" },
];

export const MandiSection = ({ language }: MandiSectionProps) => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState("Wheat");
  const { toast } = useToast();

  const t = translationsData[language || 'en'];

  const fetchPrices = async () => {
    setLoading(true);
    try {
      console.log('Fetching Mandi prices for:', selectedCommodity);
      const data = await apiClient.getMandiPrices(selectedCommodity);
      console.log('Mandi prices received:', data.length, 'records');
      setPrices(data);

      if (data.length === 0) {
        toast({
          title: t.noData,
          description: "Try selecting a different commodity",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching Mandi prices:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      console.log('Force refreshing Mandi prices for:', selectedCommodity);
      const data = await apiClient.refreshMandiPrices(selectedCommodity);
      console.log('Refreshed Mandi prices received:', data.length, 'records');
      setPrices(data);

      toast({
        title: t.refreshSuccess,
        description: `Updated ${data.length} market prices from government API`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error refreshing Mandi prices:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCommodity]);

  return (
    <Card className="w-full border-none shadow-lg bg-white overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">{t.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select onValueChange={setSelectedCommodity} value={selectedCommodity}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white border-green-200 focus:ring-green-500">
              <SelectValue placeholder={t.commodity} />
            </SelectTrigger>
            <SelectContent>
              {commodities.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            title={t.refresh}
            className="border-green-200 hover:bg-green-50 text-green-600"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-3" />
            <p className="text-sm text-gray-500 font-medium">{t.loading}</p>
          </div>
        ) : prices.length > 0 ? (
          <div className="flex flex-col">
            {/* Header Row */}
            <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
              <span>{t.market}</span>
              <span className="text-center">{t.min} / {t.max}</span>
              <span className="text-right">{t.modal}</span>
            </div>

            {/* Data Rows */}
            <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-100">
              {prices.map((price) => (
                <div
                  key={price.id}
                  className="grid grid-cols-3 gap-4 items-center px-6 py-4 hover:bg-green-50/30 transition-colors group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{price.market}</span>
                    {price.date && price.date !== "N/A" && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Last updated: {price.date}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      ₹{price.min_price.toLocaleString('en-IN')} - ₹{price.max_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      ₹{price.modal_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-base font-medium text-gray-600">{t.noData}</p>
            <p className="text-sm mt-2">
              Try: Potato, Tomato, Onion
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};