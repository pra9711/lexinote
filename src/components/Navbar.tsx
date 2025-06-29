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
    <nav className="w-full border-b border-gray-200 bg-white shadow">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center font-bold text-2xl text-blue-700"
        >
          <Sparkles className="mr-2 h-6 w-6 text-purple-500" />
          Lexinote
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <Link
            href="/pricing"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
            })}
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
            })}
          >
            Dashboard
          </Link>
        </div>

        {/* Auth/User Section */}
        <div className="flex items-center space-x-4">
          {!user ? (
            <>
              <LoginLink
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Sign in
              </LoginLink>
              <RegisterLink
                className={buttonVariants({
                  size: "sm",
                })}
              >
                <span className="flex items-center">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </RegisterLink>
            </>
          ) : (
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
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;