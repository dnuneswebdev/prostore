"use client";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";
import {updateUserProfile} from "@/lib/actions/user.actions";
import {updateProfileSchema} from "@/lib/validators";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react";
import {useForm} from "react-hook-form";
import {z} from "zod";

const ProfileForm = () => {
  const {data: session, update} = useSession();
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });
  const {toast} = useToast();

  const onSubmitUserForm = async (
    formValues: z.infer<typeof updateProfileSchema>
  ) => {
    const response = await updateUserProfile(formValues);

    if (!response.success) {
      return toast({
        description: response.message,
        variant: "destructive",
      });
    }

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: formValues.name,
        email: formValues.email,
      },
    };

    await update(newSession);

    toast({
      description: response.message,
      variant: "default",
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmitUserForm)}
      >
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({field, fieldState}) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Name"
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({field, fieldState}) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Email"
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="button col-span-2 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Updating..." : "Update"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
