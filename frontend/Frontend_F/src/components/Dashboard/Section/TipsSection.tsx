import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, Wheat, Droplets, Bug, Loader2 } from "lucide-react";
import { apiClient, type Tip } from "@/lib/api"; // This imports the correct Tip type
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TipsSectionProps {
  language: "en" | "hi" | "gu";
}

const translationsData = {
  en: {
    title: "Farming Tips",
    readMore: "Read More",
    season: "Season",
    allSeasons: "All Seasons",
  },
  hi: {
    title: "खेती टिप्स",
    readMore: "और पढ़ें",
    season: "मौसम",
    allSeasons: "सभी मौसम",
  },
  gu: {
    title: "ખેતી ટીપ્સ",
    readMore: "વધુ વાંચો",
    season: "મોસમ",
    allSeasons: "બધી ઋતુઓ",
  },
};

export const TipsSection = ({ language }: TipsSectionProps) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [season, setSeason] = useState<string>("all"); // Default to 'all'
  const { toast } = useToast();

  const fetchTips = async () => {
    setLoading(true);
    try {
      const langToFetch = language || 'en';
      // Pass the selected season to the API client
      const data = await apiClient.getTips(langToFetch, undefined, season, true);
      console.log('Tips fetched:', { language: langToFetch, season, count: data.length, sample: data[0] });
      setTips(data);
    } catch (error) { // <-- This line was fixed (removed the 'S')
      console.error('Error fetching tips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch tips when language or season changes
  useEffect(() => {
    fetchTips();
  }, [language, season]);

  // Safely get translations, default to 'en'
  const translations = translationsData[language || 'en'];
  const visibleTips = showAll ? tips : tips.slice(0, 2);

  return (
    <Card className="w-full border-none shadow-lg bg-white">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Sprout className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">{translations.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select onValueChange={setSeason} value={season}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white border-amber-200 focus:ring-amber-500">
              <SelectValue placeholder={translations.season} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{translations.allSeasons}</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="monsoon">Monsoon</SelectItem>
            </SelectContent>
          </Select>
          {!loading && tips.length > 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              {showAll ? 'Show Less' : translations.readMore}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : tips.length > 0 ? (
          <div className="grid gap-6">
            {visibleTips.map((tip) => {
              const iconMap: Record<string, any> = {
                'Sprout': Sprout,
                'Wheat': Wheat,
                'Droplets': Droplets,
                'Bug': Bug,
              };
              const Icon = iconMap[tip.icon || 'Sprout'] || Sprout;

              return (
                <Card key={tip.id} className="border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                        <Icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-amber-700 transition-colors">{tip.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {tip.description}
                        </p>

                        {tip.content && (
                          <div className="mt-3 pt-3 border-t border-amber-50">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {tip.content}
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Sprout className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm font-medium">No data found—try refreshing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
