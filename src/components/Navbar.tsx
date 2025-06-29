import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Sparkles } from "lucide-react";
import UserAccountNav from "./UserAccountNav";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/70 backdrop-blur-xl shadow-md transition-all">
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-fuchsia-400 to-indigo-500 animate-gradient-x" />
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex z-40 items-center font-extrabold text-2xl bg-gradient-to-r from-blue-600 via-fuchsia-500 to-indigo-600 bg-clip-text text-transparent animate-gradient-x tracking-tight group"
        >
          <Sparkles
            className="mr-2 h-6 w-6 text-purple-500 transition-transform duration-300 group-hover:rotate-90"
            style={{
              background: "linear-gradient(90deg, #6366f1 0%, #a21caf 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          />
          Lexinote
        </Link>

        {/* Right Side: Navigation Links + Auth/User */}
        <div className="hidden items-center space-x-4 sm:flex">
          {!user ? (
            <>
              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "hover:text-fuchsia-600 transition-colors",
                })}
              >
                Pricing
              </Link>
              <LoginLink
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "hover:text-blue-600 transition-colors",
                })}
              >
                Sign in
              </LoginLink>
              <RegisterLink
                className={buttonVariants({
                  size: "sm",
                  className:
                    "bg-gradient-to-r from-blue-500 via-fuchsia-500 to-indigo-500 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all rounded-full px-4 py-2 flex items-center gap-1",
                })}
              >
                Get started <ArrowRight className="ml-1.5 h-5 w-5" />
              </RegisterLink>
            </>
          ) : (
            <>
              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "hover:text-fuchsia-600 transition-colors",
                })}
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "hover:text-blue-600 transition-colors",
                })}
              >
                Dashboard
              </Link>
              <UserAccountNav
                name={
                  user.given_name && user.family_name
                    ? `${user.given_name} ${user.family_name}`
                    : user.given_name
                    ? user.given_name
                    : user.email ?? "Your Account"
                }
                email={user.email ?? ""}
                imageUrl={user.picture ?? ""}
              />
            </>
          )}
        </div>
      </div>
      {/* Add this style block for slow spin animation */}
      <style>{`
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;