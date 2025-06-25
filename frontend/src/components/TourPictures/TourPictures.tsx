import type { Tour } from '../../services';

interface TourPicturesProps {
  tour: Tour;
}

function TourPictures({ tour }: TourPicturesProps) {
  return (
    <section className="section-pictures">
      {tour.images.slice(0, 3).map((image, index) => (
        <div key={index} className="picture-box">
          <img
            className={`picture-box__img picture-box__img--${index + 1}`}
            src={`/img/tours/${image}`}
            alt={`${tour.name} ${index + 1}`}
          />
        </div>
      ))}
    </section>
  );
}

export default TourPictures;
