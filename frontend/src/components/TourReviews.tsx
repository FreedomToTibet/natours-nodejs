import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import type { Tour } from '../services';

interface TourReviewsProps {
  tour: Tour;
}

const TourReviews = ({ tour }: TourReviewsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (scrollRef.current) {
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const reviews = tour.reviews || [];

  // Add some fallback reviews if none exist (for demo purposes)
  const fallbackReviews = [
    {
      _id: 'fallback-1',
      review: `Amazing ${tour.duration}-day adventure! The ${tour.difficulty} difficulty level was perfect and the guides were incredibly knowledgeable. Highly recommend!`,
      rating: 5,
      user: {
        _id: 'user-1',
        name: 'Jim Brown',
        photo: 'user-7.jpg'
      }
    },
    {
      _id: 'fallback-2',
      review: `Great experience in ${tour.startLocation.description}. Well organized tour with stunning locations. The group size of ${tour.maxGroupSize} people was perfect!`,
      rating: 4,
      user: {
        _id: 'user-2',
        name: 'Laura Wilson',
        photo: 'user-15.jpg'
      }
    },
    {
      _id: 'fallback-3',
      review: `Fantastic adventure! Every location was breathtaking and the itinerary was well-planned. Definitely worth the ${tour.duration} days!`,
      rating: 5,
      user: {
        _id: 'user-3',
        name: 'Ben Hadley',
        photo: 'user-14.jpg'
      }
    },
    {
      _id: 'fallback-4',
      review: `Wonderful tour with excellent service. The ${tour.difficulty} difficulty made it accessible and enjoyable for everyone in our group.`,
      rating: 4,
      user: {
        _id: 'user-4',
        name: 'Aarav Lynn',
        photo: 'user-3.jpg'
      }
    }
  ];

  // Use actual reviews if available, otherwise use fallback reviews
  const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;

  return (
    <section className="section-reviews">
      <div
        className="reviews"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ 
          userSelect: isDragging ? 'none' : 'auto',
          cursor: isDragging ? 'grabbing' : 'grab' 
        }}
      >
        {displayReviews.map((review) => (
          <div key={review._id} className="reviews__card">
            <div className="reviews__avatar">
              <img
                src={`/img/users/${review.user.photo}`}
                alt={review.user.name}
                className="reviews__avatar-img"
              />
              <h6 className="reviews__user">{review.user.name}</h6>
            </div>
            <p className="reviews__text">
              {review.review}
            </p>
            <div className="reviews__rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  className={`reviews__star reviews__star--${
                    review.rating >= star ? 'active' : 'inactive'
                  }`}
                >
                  <use xlinkHref="/img/icons.svg#icon-star"></use>
                </svg>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TourReviews;