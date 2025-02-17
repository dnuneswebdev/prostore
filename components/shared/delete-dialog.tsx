"use client";

import {useState} from "react";
import {useTransition} from "react";
import {useToast} from "@/hooks/use-toast";
import {Button} from "../ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {Trash} from "lucide-react";

type DeleteDialogProps = {
  id: string;
  action: (id: string) => Promise<{success: boolean; message: string}>;
};

const DeleteDialog = ({id, action}: DeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();

  const handleDeleteClick = () => {
    startTransition(async () => {
      const response = await action(id);

      if (!response.success) {
        toast({
          description: response.message,
          variant: "destructive",
        });

        return;
      } else {
        setOpen(false);

        toast({
          description: response.message,
          variant: "default",
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="p-2">
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleDeleteClick}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
