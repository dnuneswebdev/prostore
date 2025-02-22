"use client";

import {useEffect} from "react";
import {Review} from "@/@types/types";
import Link from "next/link";
import {useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Calendar, StarIcon, User} from "lucide-react";
import {formatDateTime} from "@/lib/utils";
import ReviewForm from "./review-form";
import {getReviews} from "@/lib/actions/review.actions";
import Rating from "@/components/shared/products/rating";

type ReviewListProps = {
  userId: string;
  productId: string;
  productSlug: string;
};

const ReviewList = ({userId, productId, productSlug}: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const response = await getReviews({productId});
      setReviews(response.data);
    };

    loadReviews();
  }, [productId]);

  // Reload reviews after created or updated
  const reload = async () => {
    const response = await getReviews({productId});
    setReviews([...response.data]);
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        <>
          <ReviewForm
            userId={userId}
            productId={productId}
            onReviewSubmitted={reload}
          />
        </>
      ) : (
        <div>
          Please
          <Link
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
            className="text-blue-600 px-2"
          >
            Sign In
          </Link>
          to write the review
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="flex flex-row align-middle">
              <User size={28} />
              <CardTitle>{review.user ? review.user.name : "User"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Rating value={review.rating} />
              </div>
              <div>{review.title}</div>
              <div>{review.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
