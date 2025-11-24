import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ExternalLink, Loader2 } from "lucide-react";
import { apiClient, type Scheme } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SchemesSectionProps {
  language: "en" | "hi" | "gu";
}

// --- ADD THIS TRANSLATION OBJECT ---
const translationsData = {
  en: {
    title: "Government Schemes",
    readMore: "Read More",
    showLess: "Show Less",
  },
  hi: {
    title: "सरकारी योजनाएं",
    readMore: "और पढ़ें",
    showLess: "कम दिखाएं",
  },
  gu: {
    title: "સરકારી યોજનાઓ",
    readMore: "વધુ વાંચો",
    showLess: "ઓછું બતાવો",
  },
};
// --- END OF ADDITION ---

export const SchemesSection = ({ language }: SchemesSectionProps) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  // --- ADD THIS LINE ---
  // Safely get translations, default to 'en'
  const translations = translationsData[language || 'en'];

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      // Use the language prop, but default to 'en' just in case
      const langToFetch = language || 'en';
      const data = await apiClient.getSchemes(langToFetch, true);
      console.log('Schemes fetched:', { language: langToFetch, count: data.length, sample: data[0] });
      setSchemes(data);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schemes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [language]); // Re-fetches when language changes

  const visibleSchemes = showAll ? schemes : schemes.slice(0, 3);

  return (
    <Card className="w-full border-none shadow-lg bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ExternalLink className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">{translations.title}</CardTitle>
        </div>

        {!loading && schemes.length > 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {showAll ? translations.showLess : translations.readMore}
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : schemes.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {visibleSchemes.map((scheme) => {
              return (
                <AccordionItem key={scheme.id} value={scheme.id} className="border border-blue-100 rounded-xl px-4 data-[state=open]:bg-blue-50/50 data-[state=open]:border-blue-200 transition-all">
                  <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-blue-700 py-4">
                    {scheme.name}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {scheme.description}
                    </p>
                    {scheme.application_url && (
                      <Button
                        size="sm"
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                        onClick={() => window.open(scheme.application_url, '_blank')}
                      >
                        Apply Now
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ExternalLink className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm font-medium">No data found—try refreshing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
