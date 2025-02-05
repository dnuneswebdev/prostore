import Image from "next/image";
import Link from "next/link";
import {APP_NAME} from "@/lib/constants";
import Menu from "./menu";
// import CategoryDrawer from './category-drawer';
// import Search from './search';

export const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between items-center">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} logo`}
              width={35}
              height={35}
              priority={true}
            />
            <span className="hidden font-bold text-2xl ml-3 lg:block">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <Menu />
      </div>
    </header>
  );
};
