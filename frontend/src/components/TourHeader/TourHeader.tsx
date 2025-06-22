function TourHeader() {
  return (
    <section className="section-header">
      <div className="header__hero">
        <div className="header__hero-overlay">&nbsp;</div>
        <img
          className="header__hero-img"
          src="/img/tours/tour-5-cover.jpg"
          alt="The Park Camper"
        />
      </div>
      <div className="heading-box">
        <h1 className="heading-primary">
          <span>The Park Camper Tour</span>
        </h1>
        <div className="heading-box__group">
          <div className="heading-box__detail">
            <svg className="heading-box__icon">
              <use xlinkHref="/img/icons.svg#icon-clock"></use>
            </svg>
            <span className="heading-box__text">10 days</span>
          </div>
          <div className="heading-box__detail">
            <svg className="heading-box__icon">
              <use xlinkHref="/img/icons.svg#icon-map-pin"></use>
            </svg>
            <span className="heading-box__text">Las Vegas, USA</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TourHeader;
