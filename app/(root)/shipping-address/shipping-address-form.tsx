"use client";

import {useRouter} from "next/navigation";
import {useToast} from "@/hooks/use-toast";
import {useTransition} from "react";
import {shippingAddressSchema} from "@/lib/validators";
import {ShippingAddress} from "@/@types/types";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm, SubmitHandler} from "react-hook-form";
import {z} from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ArrowRight, LoaderCircle} from "lucide-react";
import {updateUserAddress} from "@/lib/actions/user.actions";

type ShippingAddressFormProps = {
  address: ShippingAddress;
};

const ShippingAddressForm = ({address}: ShippingAddressFormProps) => {
  const router = useRouter();
  const {toast} = useToast();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || {},
  });

  const onSubmitForm: SubmitHandler<
    z.infer<typeof shippingAddressSchema>
  > = async (formValues) => {
    startTransition(async () => {
      const response = await updateUserAddress(formValues);

      if (!response.success) {
        toast({description: response.message, variant: "destructive"});
        return;
      }

      router.push("/payment-method");
    });
  };

  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Shipping Address</h1>
        <p className="text-sm text-muted-foreground">
          Please enter and address to ship to
        </p>
        <Form {...form}>
          <form
            method="POST"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmitForm)}
          >
            <div className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="fullName"
                render={({field}) => (
                  <FormItem className="w-full">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="streetAddress"
                render={({field}) => (
                  <FormItem className="w-full">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="city"
                render={({field}) => (
                  <FormItem className="w-full">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="postalCode"
                render={({field}) => (
                  <FormItem className="w-full">
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter postal code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="country"
                render={({field}) => (
                  <FormItem className="w-full">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isPending}
                variant="default"
                className="w-full"
              >
                {isPending ? (
                  <LoaderCircle className="w-4 h-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}{" "}
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ShippingAddressForm;
