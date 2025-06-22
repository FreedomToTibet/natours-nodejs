function TourReviews() {
  const reviews = [
    {
      id: '1',
      user: { name: 'Jim Brown', photo: 'user-7.jpg' },
      review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque alias animi.',
      rating: 5,
    },
    {
        id: '2',
        user: { name: 'Laura Wilson', photo: 'user-15.jpg' },
        review: 'Veniam ex ea et eum quo voluptatem unde nihil.',
        rating: 4,
    },
    {
        id: '3',
        user: { name: 'Ben Hadley', photo: 'user-14.jpg' },
        review: 'Accusantium quis, voluptates dolore eaque.',
        rating: 5,
    },
    {
        id: '4',
        user: { name: 'Aarav Lynn', photo: 'user-3.jpg' },
        review: 'Quo, vitae quidem, quod soluta.',
        rating: 4,
    },
  ];

  return (
    <section className="section-reviews">
      <div className="reviews">
        {reviews.map((review) => (
          <div className="reviews__card" key={review.id}>
            <div className="reviews__avatar">
              <img
                className="reviews__avatar-img"
                src={`/img/users/${review.user.photo}`}
                alt={review.user.name}
              />
              <h6 className="reviews__user">{review.user.name}</h6>
            </div>
            <p className="reviews__text">{review.review}</p>
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
}

export default TourReviews;
