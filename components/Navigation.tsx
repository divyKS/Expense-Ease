'use client'

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation"

import { useMedia } from "react-use"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavButton } from "./NavButton";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

const routes = [
    {
      href: "/",
      label: "Overview",
    },
    {
      href: "/transactions",
      label: "Transactions",
    },
    {
      href: "/accounts",
      label: "Accounts",
    },
    {
      href: "/categories",
      label: "Categories",
    },
    {
      href: "/settings",
      label: "Settings",
    },
];

export const Navigation = () => {
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const isMobile = useMedia("(max-width: 1024px)", false)
    
    const onClick = (href: string) => {
        // not using Link since, that would'nt close the drawer, we have to manage that via state
        router.push(href);
        setDrawerIsOpen(false);
    };

    if(isMobile){
        return (            
            <Sheet open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-none bg-white/10 font-normal text-white outline-none transition hover:bg-white/20 hover:text-white focus:bg-white/30 focus-visible:ring-transparent focus-visible:ring-offset-0"
                    >
                        <Menu className="size-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="px-2">
                    <nav className="flex flex-col gap-y-2 pt-6">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.href === pathname ? "secondary" : "ghost"}
                                onClick={() => onClick(route.href)}
                                className="w-full justify-start"
                            >
                                {route.label}
                            </Button>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
            {routes.map((route) => (
                <NavButton
                    key={route.href}
                    label={route.label}
                    href={route.href}
                    isActive={route.href === pathname}
                />
            ))}
        </nav>
    );
}