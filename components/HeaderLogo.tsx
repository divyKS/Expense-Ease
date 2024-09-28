import Image from "next/image";
import Link from "next/link";

export const HeaderLogo = () => {
    return (
        <Link href="/">
            <div className="hidden  lg:flex items-center">
                <Image src="/logo.svg" alt="ExpenseEase Logo" height={28} width={28} />
                <p className="ml-2.5 text-2xl font-semibold text-white">Expense Ease</p>
            </div>
        </Link>
    );
};