import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';

const TourReviews = () => {
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

  // Static review data for now, will be replaced with dynamic data later
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
        {/* Static reviews - will be replaced with dynamic data */}
        {[1, 2, 3, 4, 5, 6].map((_, i) => (
          <div key={i} className="reviews__card">
            <div className="reviews__avatar">
              <img
                src="/img/users/user-7.jpg"
                alt="Jim Brown"
                className="reviews__avatar-img"
              />
              <h6 className="reviews__user">Jim Brown</h6>
            </div>
            <p className="reviews__text">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque
              dignissimos sint quo commodi corrupti accusantium veniam saepe
              numquam.
            </p>
            <div className="reviews__rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="reviews__star reviews__star--active">
                  <use xlinkHref="/img/icons.svg#icon-star"></use>
                </svg>
              ))}
            </div>
          </div>
        ))}      </div>
    </section>
  );
};

export default TourReviews;