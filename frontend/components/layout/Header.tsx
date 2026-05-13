"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ArrowUpRight,
  GraduationCap,
  LogIn,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";
import { UserProfileDropdown } from "./user-profile-dropdown";

export function Header() {
  const pathname = usePathname();
  const t = useTranslations("Navbar");
  const { getMeQuery } = useAuthQueries();
  const user = getMeQuery.data;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const locale = useLocale();

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("features"), href: "/#features" },
    { name: t("how_it_works"), href: "/#steps" },
    { name: t("project_details"), href: "/project-details" },
  ];

  const currentPath = pathname?.replace(`/${locale}`, "") || "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  if (pathname?.includes("/dashboard")) return null;

  return (
    <>
      <div className="h-20" />
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center p-4 sm:p-6 pointer-events-none">
        <header
          className={cn(
            "w-full max-w-7xl flex items-center justify-between px-6 py-2 rounded-2xl transition-all duration-500 pointer-events-auto",
            isMobile
              ? "bg-background border border-border/50 shadow-2xl py-3"
              : scrolled
                ? "bg-background/70 backdrop-blur-xl border border-border/50 shadow-2xl py-3"
                : "bg-transparent py-4",
          )}
        >
          {/* Mobile Menu - Full Screen Overlay */}
          <div
            className={cn(
              "fixed inset-0 z-40 bg-background transition-all duration-500 flex flex-col items-center p-8 md:hidden",
              mobileMenuOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-full pointer-events-none",
            )}
          >
            {/* Mobile Menu Header */}
            <div className="w-full flex items-center justify-between mb-12">
              <Link
                href={`/${locale}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 group shrink-0"
              >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-black tracking-tighter text-foreground leading-none">
                    StudentFlow
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold text-primary/80",
                      locale !== "ar" && "tracking-[0.15em] uppercase",
                    )}
                  >
                    Management System
                  </span>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-2xl w-12 h-12 border border-border/20 bg-secondary/30 backdrop-blur-md text-foreground"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {navigation.map((item, idx) => (
                  <Link
                    key={item.name}
                    href={`/${locale}${item.href}`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ transitionDelay: `${idx * 50}ms` }}
                    className={cn(
                      "text-lg font-bold text-foreground bg-secondary/80 dark:bg-white/10 p-5 rounded-2xl hover:bg-primary hover:text-white transition-all text-center border border-border/40 shadow-sm",
                      locale !== "ar" && "tracking-wide uppercase",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="h-[1px] w-full bg-border/50 my-4" />

              <div className="flex flex-col gap-6 items-center">
                <div className="flex items-center gap-6">
                  <ThemeToggle />
                  <div className="w-[1px] h-8 bg-border/50" />
                  <Suspense fallback={<div className="w-8 h-8" />}>
                    <LanguageSwitcher />
                  </Suspense>
                </div>

                {user ? (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <UserProfileDropdown align="center" />
                    <span className="text-sm font-bold text-muted-foreground">{user.full_name}</span>
                  </div>
                ) : (
                  <>
                    <Link href={`/${locale}/login`} className="w-full">
                      <Button
                        className="w-full rounded-2xl bg-transparent border-2 border-primary h-14 text-primary font-bold text-lg shadow-none flex gap-3 hover:bg-primary/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LogIn className="w-5 h-5" />
                        {t("login")}
                      </Button>
                    </Link>

                    <Link href={`/${locale}/register`} className="w-full">
                      <Button
                        className="w-full rounded-2xl bg-primary h-16 text-white font-black text-xl shadow-2xl shadow-primary/30 flex gap-3"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ArrowUpRight className="w-6 h-6" />
                        {t("signup")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-foreground leading-none">
                StudentFlow
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold text-primary/80",
                  locale !== "ar" && "tracking-[0.15em] uppercase",
                )}
              >
                Management System
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 p-1">
            {navigation.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "relative px-5 py-2.5 rounded-full text-sm font-bold overflow-hidden transition-all duration-300 group",
                    locale !== "ar" && "uppercase tracking-wider",
                    isActive
                      ? "text-primary-foreground bg-primary shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-white",
                  )}
                >
                  {/* Hover slide background */}
                  {!isActive && (
                    <span className="absolute inset-0 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Suspense fallback={<div className="w-8 h-8" />}>
                  <LanguageSwitcher />
                </Suspense>
                <ThemeToggle />
              </div>
            </div>

            {user ? (
              <UserProfileDropdown />
            ) : (
              <>
                <Link href={`/${locale}/login`} className="hidden md:block">
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative rounded-full px-6 h-11 font-bold text-xs text-foreground/80 overflow-hidden group transition-all duration-300 hover:text-white hover:bg-transparent",
                      locale !== "ar" && "uppercase tracking-widest",
                    )}
                  >
                    <span className="absolute inset-0 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    <LogIn className="w-4 h-4 me-2 relative z-10" />
                    <span className="relative z-10">{t("login")}</span>
                  </Button>
                </Link>

                <Link href={`/${locale}/register`}>
                  <Button
                    className={cn(
                      "hidden md:flex rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 border-none font-black text-xs gap-2 transition-all hover:scale-105 active:scale-95 group shadow-xl shadow-primary/25",
                      locale !== "ar" && "uppercase tracking-widest",
                    )}
                  >
                    {t("signup")}
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-2xl w-12 h-12 border border-border/20 bg-secondary/30 backdrop-blur-md text-foreground hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </header>
      </div>
    </>
  );
}
