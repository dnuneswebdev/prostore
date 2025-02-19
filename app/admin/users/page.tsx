import {Metadata} from "next";
import {deleteUser, getAllUsers} from "@/lib/actions/user.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatId} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Pagination from "@/components/shared/pagination";
import {Badge} from "@/components/ui/badge";
import DeleteDialog from "@/components/shared/delete-dialog";
import {Eye} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Users",
};

type AdminUserPageProps = {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
};

const AdminUserPage = async ({searchParams}: AdminUserPageProps) => {
  const {page = "1", query: searchText} = await searchParams;
  const users = await getAllUsers({page: Number(page), query: searchText});

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Users</h1>
        {searchText && (
          <div className="gap-2 flex items-center">
            Filtered by <i>&quot;{searchText}&quot;</i>{" "}
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                Clear filter
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>USER ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead className="flex justify-end">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{formatId(user.id)}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role === "user" ? (
                  <Badge variant="secondary">USER</Badge>
                ) : (
                  <Badge variant="default">ADMIN</Badge>
                )}
              </TableCell>
              <TableCell className="flex gap-2 justify-end">
                <Button asChild variant="outline" size="sm" className="p-2">
                  <Link href={`/admin/users/${user.id}`}>
                    <Eye />
                  </Link>
                </Button>
                <DeleteDialog id={user.id} action={deleteUser} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.totalPages > 1 && (
        <Pagination page={Number(page) || 1} totalPages={users?.totalPages} />
      )}
    </div>
  );
};

export default AdminUserPage;
