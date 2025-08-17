"use client";

import { Menu, X, Bot } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const NAV_ITEMS = [
  { name: "ГЛАВНАЯ", link: "#hero" },
  { name: "ОБО МНЕ", link: "#about" },
  { name: "УСЛУГИ", link: "#services" },
  { name: "ОТЗЫВЫ", link: "#testimonials" },
  { name: "FAQ", link: "#faq" },
  { name: "КОНТАКТЫ", link: "#contact" },
];

const AnimatedIndicatorNavbar = () => {
  const [activeItem, setActiveItem] = useState(NAV_ITEMS[0].name);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const indicatorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Mount protection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = NAV_ITEMS.map(item => ({
        name: item.name,
        element: document.querySelector(item.link)
      })).filter(section => section.element);

      const current = sections.find(section => {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (current) {
        setActiveItem(current.name);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const updateIndicator = () => {
      const activeEl = document.querySelector(
        `[data-nav-item="${activeItem}"]`
      ) as HTMLElement;

      if (activeEl && indicatorRef.current && menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        const itemRect = activeEl.getBoundingClientRect();

        indicatorRef.current.style.width = `${itemRect.width}px`;
        indicatorRef.current.style.left = `${itemRect.left - menuRect.left}px`;
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeItem, isMounted]);

  const scrollToSection = (sectionId: string, itemName: string) => {
    if (!isMounted) return;
    
    const element = document.querySelector(sectionId);
    if (element) {
      setActiveItem(itemName);
      
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="container">
      <nav className="flex items-center justify-between py-4">
        {/* Logo */}
        <button 
          onClick={() => scrollToSection('#hero', 'ГЛАВНАЯ')}
          className="text-xl font-bold font-[var(--font-display)] text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors duration-200"
        >
          NSLNV
        </button>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList
            ref={menuRef}
            className="relative flex items-center gap-6 px-6 py-2"
          >
            {NAV_ITEMS.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink
                  data-nav-item={item.name}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.link, item.name);
                  }}
                  className={`relative cursor-pointer text-sm font-medium transition-all duration-200 py-2 px-3 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    activeItem === item.name
                      ? "text-[var(--color-text)] bg-[var(--color-card)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]"
                  }`}
                >
                  {item.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            
            {/* Active Indicator */}
            {isMounted && (
              <div
                ref={indicatorRef}
                className="absolute bottom-0 h-0.5 bg-[var(--color-primary)] transition-all duration-300 rounded-full"
              />
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Status - Desktop only */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 bg-[var(--color-success)] rounded-full" />
            <span className="text-xs text-[var(--color-muted)]">
              ДОСТУПЕН
            </span>
          </div>

          {/* Mobile Menu */}
          <MobileNav activeItem={activeItem} scrollToSection={scrollToSection} isMounted={isMounted} />
        </div>
      </nav>
    </div>
  );
};

export { AnimatedIndicatorNavbar };

const MobileNav = ({
  activeItem,
  scrollToSection,
  isMounted,
}: {
  activeItem: string;
  scrollToSection: (id: string, name: string) => void;
  isMounted: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="block md:hidden">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            {isOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-56 p-2"
        >
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  if (isMounted) {
                    scrollToSection(item.link, item.name);
                    setIsOpen(false);
                  }
                }}
                className={`text-left p-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeItem === item.name
                    ? "text-[var(--color-text)] bg-[var(--color-card)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]"
                }`}
              >
                {item.name}
              </button>
            ))}
            
            {/* AI Chat Link for Mobile */}
            <Link href="/nslnv-ai" className="w-full">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left p-3 text-sm font-medium rounded-lg transition-colors duration-200 text-[var(--color-primary)] hover:bg-[var(--color-card)] flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                NSLNV AI
              </button>
            </Link>
            
            <div className="flex items-center gap-2 px-3 py-2 mt-2 border-t border-[var(--color-line)]">
              <div className="w-2 h-2 bg-[var(--color-success)] rounded-full" />
              <span className="text-xs text-[var(--color-muted)]">
                ДОСТУПЕН
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};