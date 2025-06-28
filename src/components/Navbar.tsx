import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Sparkles } from "lucide-react";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";

const navLinks = [
  { href: "/pricing", label: "Pricing", color: "fuchsia" },
  { href: "/dashboard", label: "Dashboard", color: "blue" },
];

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-gray-200/30 bg-white/90 backdrop-blur-lg shadow-lg">

      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
      
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex z-50 items-center font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform duration-200 group"
          >
            <Sparkles className="mr-2 h-6 w-6 text-purple-500 group-hover:animate-spin" />
            Lexinote
          </Link>

          <MobileNav isAuth={!!user} />

          <div className="hidden items-center space-x-4 sm:flex z-50">
            {!user ? (
              <>
                {/* Pricing Link */}
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "hover:text-purple-600 transition-colors duration-200 hover:scale-105",
                  })}
                >
                  Pricing
                </Link>

                {/* Sign In Button */}
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "hover:text-blue-600 transition-colors duration-200 hover:scale-105",
                  })}
                >
                  Sign in
                </LoginLink>

                {/* Get Started Button */}
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                    className: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 py-2 hover:scale-105",
                  })}
                >
                  <span className="flex items-center">
                    Get started
                    <span className="ml-1">🚀</span>
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </RegisterLink>
              </>
            ) : (
              <>
                {/* Pricing Link for authenticated users */}
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "hover:text-purple-600 transition-colors duration-200 hover:scale-105",
                  })}
                >
                  Pricing
                </Link>

                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "hover:text-blue-600 transition-colors duration-200 hover:scale-105",
                  })}
                >
                  Dashboard
                </Link>

                {/* User Account Nav */}
                <div className="relative z-50">
                  <UserAccountNav
                    name={
                      !user.given_name || !user.family_name
                        ? "Your Account"
                        : `${user.given_name} ${user.family_name}`
                    }
                    email={user.email ?? ""}
                    imageUrl={user.picture ?? ""}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;