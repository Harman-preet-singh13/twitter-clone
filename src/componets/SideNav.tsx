import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import IconHoverEffect from "./IconHoverEffect";
import { VscAccount, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc";
import logo from "../images/logo/logo-black.png";

export default function SideNav() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <nav className="sticky top-0 px-2 py-4">
      <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="item-center flex gap-4">
                  <img src={logo.src} alt="logo" className="h-8 w-8" />
              </span>
            </IconHoverEffect>
          </Link>
        </li>

        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="item-center flex gap-4">
                <VscHome className="h-8 w-8" />
                <span className="hidden text-lg md:inline">Home</span>
              </span>
            </IconHoverEffect>
          </Link>
        </li>

        {/* if there is no user nothing to print */}

        {user != null && (
          <li>
            <Link href={`/profiles/${user.id}`}>
              <IconHoverEffect>
                <span className="item-center flex gap-4">
                  <VscAccount className="h-8 w-8" />
                  <span className="hidden text-lg md:inline">Profile</span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}

        {/* if user is logged in then log out will be hidden nad vice versa */}
        {user == null ? (
          <li>
            <button onClick={() => void signIn()}>
              <IconHoverEffect>
                <span className="item-center flex gap-4">
                  <VscSignIn className="h-8 w-8 fill-green-700" />
                  <span className="hidden text-lg text-green-700 md:inline">
                    Log In
                  </span>
                </span>
              </IconHoverEffect>
            </button>
          </li>
        ) : (
          <li>
            <button onClick={() => void signOut()}>
              <IconHoverEffect>
                <span className="item-center flex gap-4">
                  <VscSignOut className="h-8 w-8 fill-red-700" />
                  <span className="hidden text-lg text-red-700 md:inline">
                    Log Out
                  </span>
                </span>
              </IconHoverEffect>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
