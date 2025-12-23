import { Link, useLocation } from "wouter";
import { Home, List, Clock, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Decide" },
    { href: "/options", icon: UtensilsCrossed, label: "Places" },
    { href: "/history", icon: Clock, label: "History" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border safe-bottom pb-2 pt-2">
      <div className="max-w-md mx-auto flex justify-around items-center px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 group",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 mb-1 transition-transform duration-200",
                    isActive ? "scale-110 stroke-[2.5px]" : "group-hover:scale-105"
                  )}
                />
                <span className="text-[10px] font-medium tracking-wide">
                  {label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
