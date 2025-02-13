import {auth} from "@/auth";
import {Button} from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {signOutUser} from "@/lib/actions/user.actions";
import {LogOut, TableOfContents, User, User2} from "lucide-react";
import Link from "next/link";

const UserButton = async () => {
  const session = await auth();

  if (!session)
    return (
      <Button asChild variant="default">
        <Link href="/sign-in">
          <User /> Sign In
        </Link>
      </Button>
    );

  const firstInitial = session.user?.name?.charAt(0).toLocaleUpperCase() ?? "";

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200"
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium leading-none">
                {session.user?.name}
              </div>
              <div className="text-sm font-muted-foreground leading-none">
                {session.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem className="p-0 mb-1">
            <Link href="/user/profile">
              <Button
                className="w-full py-4 px-2 h-4 justify-start"
                variant="ghost"
              >
                <User2 /> Profile
              </Button>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 mb-1">
            <Link href="/user/orders">
              <Button
                className="w-full py-4 px-2 h-4 justify-start"
                variant="ghost"
              >
                <TableOfContents /> Orders
              </Button>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 mb-1">
            <form action={signOutUser} className="w-full">
              <Button
                className="w-full py-4 px-2 h-4 justify-start"
                variant="ghost"
              >
                <LogOut />
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
