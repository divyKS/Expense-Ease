import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs"
import { HeaderLogo } from "./HeaderLogo"
import { Navigation } from "./Navigation"
import { Loader2 } from "lucide-react"
import { WelcomeMessage } from "./WelcomeMessage"

const Header = () => {
    return (
        <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-14 lg:pb-32">
            <div className="mx-auto max-w-screen-2xl">
                <div className="mb-14 w-full flex items-center justify-between">
                    <div className="flex items-center lg:gap-x-16">
                        <HeaderLogo />
                        <Navigation />
                    </div>
                    <ClerkLoaded>
                        <UserButton />
                    </ClerkLoaded>
                    <ClerkLoading>
                        <Loader2 className="size-8 animate-spin text-slate-400"/>
                    </ClerkLoading>
                </div>
                <WelcomeMessage />
            </div>
        </header>
    )
}

export default Header