import {loadStripe} from "@stripe/stripe-js";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {useTheme} from "next-themes";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {formatCurrency} from "@/lib/utils";
import {BASE_URL} from "@/lib/constants";

type StripePaymentProps = {
  priceIncents: number;
  orderId: string;
  clientSecret: string;
};

const StripePayment = ({
  priceIncents,
  orderId,
  clientSecret,
}: StripePaymentProps) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  );
  const {theme, systemTheme} = useTheme();

  //StripeFormCOmponent
  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsloading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [email, setEmail] = useState("");

    const handleStripeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!stripe || !elements || !email) return;

      setIsloading(true);

      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${BASE_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({error}) => {
          if (
            error?.type === "card_error" ||
            error?.type === "validation_error"
          ) {
            setErrorMsg(error?.message ?? "An unknown error occurred");
          } else if (error) {
            setErrorMsg("An unknown error occurred");
          }
        })
        .finally(() => {
          setIsloading(false);
        });
    };

    return (
      <form className="space-y-4" onSubmit={handleStripeSubmit}>
        <div className="text-xl">Stripe Checkout</div>
        {errorMsg && <div className="text-destructive">{errorMsg}</div>}
        <PaymentElement />
        <div>
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={stripe == null || elements == null || isLoading}
        >
          {isLoading
            ? "Purchasing..."
            : `Purchase ${formatCurrency(priceIncents / 100)}`}
        </Button>
      </form>
    );
  };

  return (
    <Elements
      options={{
        clientSecret,
        appearance: {theme: theme === "dark" ? "night" : "stripe"},
      }}
      stripe={stripePromise}
    >
      <StripeForm />
    </Elements>
  );
};

export default StripePayment;
