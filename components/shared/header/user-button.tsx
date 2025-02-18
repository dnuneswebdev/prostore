import {auth} from "@/auth";
import {Button} from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {signOutUser} from "@/lib/actions/user.actions";
import {
  LayoutDashboard,
  LogOut,
  TableOfContents,
  User,
  User2,
} from "lucide-react";
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

          <DropdownMenuSeparator />

          {session.user?.role === "admin" && (
            <DropdownMenuItem>
              <Link
                href="/admin/dashboard"
                className="p-0 mb-1 w-full flex items-center gap-2"
              >
                <LayoutDashboard /> Dashboard
              </Link>
            </DropdownMenuItem>
          )}

          {session.user?.role !== "admin" && (
            <DropdownMenuItem>
              <Link
                href="/user/orders"
                className="p-0 mb-1 w-full flex items-center gap-2"
              >
                <TableOfContents /> Orders
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem>
            <Link
              href="/user/profile"
              className="p-0 mb-1 w-full flex items-center gap-2"
            >
              <User2 /> Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

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
