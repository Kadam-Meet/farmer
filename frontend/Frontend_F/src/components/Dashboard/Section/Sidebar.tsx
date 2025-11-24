import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Bell,
  X,
  Bot,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  language: "en" | "hi" | "gu";
}

const menuItems = {
  en: [
    { icon: Home, label: "Home", path: "/" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Bot, label: "Agri-Tools (AI & Data)", path: "/agri-tools" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ],
  hi: [
    { icon: Home, label: "होम", path: "/" },
    { icon: User, label: "प्रोफाइल", path: "/profile" },
    { icon: Bot, label: "कृषि उपकरण (AI)", path: "/agri-tools" },
    { icon: Bell, label: "सूचनाएं", path: "/notifications" },
  ],
  gu: [
    { icon: Home, label: "હોમ", path: "/" },
    { icon: User, label: "પ્રોફાઇલ", path: "/profile" },
    { icon: Bot, label: "કૃષિ સાધનો (AI)", path: "/agri-tools" },
    { icon: Bell, label: "સૂચનાઓ", path: "/notifications" },
  ],
};

const SidebarContent = ({ language }: { language: "en" | "hi" | "gu" }) => {
  const items = menuItems[language];
  const location = useLocation();

  return (
    <nav className="space-y-2 p-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link to={item.path} key={item.label}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 mb-2",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};

export const Sidebar = ({ open, setOpen, language }: SidebarProps) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-card">
        <div className="h-full overflow-y-auto">
          <SidebarContent language={language} />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">
              {language === "en" ? "Menu" : language === "hi" ? "मेनू" : "મેનૂ"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent language={language} />
        </SheetContent>
      </Sheet>
    </>
  );
};
