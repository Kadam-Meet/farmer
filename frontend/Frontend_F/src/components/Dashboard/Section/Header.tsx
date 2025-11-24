import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaderProps {
  language: "en" | "hi" | "gu";
  setLanguage: (lang: "en" | "hi" | "gu") => void;
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ language, setLanguage, setSidebarOpen }: HeaderProps) => {
  const translations = {
    en: {
      welcome: "Welcome back, Farmer!",
      logout: "Logout",
      language: "EN",
    },
    hi: {
      welcome: "स्वागत है, किसान!",
      logout: "लॉग आउट",
      language: "हिं",
    },
    gu: {
      welcome: "સ્વાગત છે, ખેડૂત!",
      logout: "લૉગ આઉટ",
      language: "ગુ",
    },
  };

  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">
            {t.welcome}
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-[110px]">
            <Select value={language} onValueChange={(val: string) => setLanguage(val as "en" | "hi" | "gu")}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="gu">ગુજરાતી</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <Button variant="ghost" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">{t.logout}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
