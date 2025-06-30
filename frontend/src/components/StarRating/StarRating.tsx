import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'medium' }: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'star-rating--small';
      case 'large':
        return 'star-rating--large';
      default:
        return 'star-rating--medium';
    }
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      const filled = i <= displayRating;
      
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-rating__star ${filled ? 'star-rating__star--filled' : ''} ${
            readonly ? 'star-rating__star--readonly' : ''
          }`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          disabled={readonly}
          aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
        >
          <svg className="star-rating__icon">
            <use xlinkHref="/img/icons.svg#icon-star"></use>
          </svg>
        </button>
      );
    }

    return stars;
  };

  return (
    <div 
      className={`star-rating ${getSizeClass()}`}
      onMouseLeave={handleMouseLeave}
    >
      {renderStars()}
      {readonly && (
        <span className="star-rating__text">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
