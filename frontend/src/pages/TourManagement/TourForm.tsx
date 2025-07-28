import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tour } from '../../services';

interface TourFormProps {
  initialData?: Tour;
  onSubmit: (tourData: any) => void;
  isLoading: boolean;
  isEdit?: boolean;
}

const TourForm: React.FC<TourFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  isEdit = false
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    duration: 0,
    maxGroupSize: 0,
    difficulty: 'easy',
    price: 0,
    summary: '',
    description: '',
    imageCover: null as File | null,
    images: [] as File[],
    startDates: [''] as string[],
    startLocation: {
      description: '',
      address: '',
      coordinates: [0, 0]
    },
    locations: [{
      description: '',
      day: 1,
      coordinates: [0, 0]
    }],
    guides: [] as string[]
  });

  useEffect(() => {
    if (initialData) {
      // Map the initial data to formData
      setFormData({
        ...initialData,
        imageCover: null,
        images: [],
        startDates: initialData.startDates.map(date => 
          new Date(date).toISOString().split('T')[0]
        ),
        guides: initialData.guides?.map(guide => 
          typeof guide === 'string' ? guide : guide._id
        ) || []
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like startLocation.description
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleImageCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageCover: file }));
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({ ...prev, images: Array.from(files) }));
    }
  };

  const handleStartDateChange = (index: number, value: string) => {
    setFormData(prev => {
      const newDates = [...prev.startDates];
      newDates[index] = value;
      return { ...prev, startDates: newDates };
    });
  };

  const addStartDate = () => {
    setFormData(prev => ({
      ...prev,
      startDates: [...prev.startDates, '']
    }));
  };

  const removeStartDate = (index: number) => {
    setFormData(prev => {
      const newDates = [...prev.startDates];
      newDates.splice(index, 1);
      return { ...prev, startDates: newDates };
    });
  };

  const handleLocationChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newLocations = [...prev.locations];
      // @ts-ignore
      newLocations[index] = { ...newLocations[index], [field]: field === 'day' ? parseInt(value as string, 10) : value };
      return { ...prev, locations: newLocations };
    });
  };

  const handleCoordinateChange = (index: number, coordIndex: number, value: string) => {
    setFormData(prev => {
      const newLocations = [...prev.locations];
      const newCoords = [...newLocations[index].coordinates];
      newCoords[coordIndex] = parseFloat(value);
      newLocations[index] = { ...newLocations[index], coordinates: newCoords };
      return { ...prev, locations: newLocations };
    });
  };

  const handleStartLocationCoordinateChange = (coordIndex: number, value: string) => {
    setFormData(prev => {
      const newStartLocation = { ...prev.startLocation };
      const newCoords = [...newStartLocation.coordinates];
      newCoords[coordIndex] = parseFloat(value);
      return { ...prev, startLocation: { ...newStartLocation, coordinates: newCoords } };
    });
  };

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      locations: [
        ...prev.locations,
        {
          description: '',
          day: prev.locations.length > 0 ? prev.locations[prev.locations.length - 1].day + 1 : 1,
          coordinates: [0, 0]
        }
      ]
    }));
  };

  const removeLocation = (index: number) => {
    setFormData(prev => {
      const newLocations = [...prev.locations];
      newLocations.splice(index, 1);
      return { ...prev, locations: newLocations };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create FormData object for file uploads
    const tourData = new FormData();
    
    // Add text fields
    tourData.append('name', formData.name);
    tourData.append('duration', formData.duration.toString());
    tourData.append('maxGroupSize', formData.maxGroupSize.toString());
    tourData.append('difficulty', formData.difficulty);
    tourData.append('price', formData.price.toString());
    tourData.append('summary', formData.summary);
    tourData.append('description', formData.description);
    
    // Add start location
    tourData.append('startLocation[type]', 'Point');
    tourData.append('startLocation[description]', formData.startLocation.description);
    tourData.append('startLocation[address]', formData.startLocation.address);
    tourData.append('startLocation[coordinates][0]', formData.startLocation.coordinates[0].toString());
    tourData.append('startLocation[coordinates][1]', formData.startLocation.coordinates[1].toString());
    
    // Add locations
    formData.locations.forEach((location, i) => {
      tourData.append(`locations[${i}][type]`, 'Point');
      tourData.append(`locations[${i}][description]`, location.description);
      tourData.append(`locations[${i}][day]`, location.day.toString());
      tourData.append(`locations[${i}][coordinates][0]`, location.coordinates[0].toString());
      tourData.append(`locations[${i}][coordinates][1]`, location.coordinates[1].toString());
    });
    
    // Add start dates (only non-empty dates)
    formData.startDates.forEach((date) => {
      if (date && date.trim()) {
        tourData.append('startDates', date);
      }
    });
    
    // Add guides (only if provided)
    formData.guides.forEach((guide) => {
      if (guide && guide.trim()) {
        tourData.append('guides', guide);
      }
    });
    
    // Add image cover if present
    if (formData.imageCover) {
      tourData.append('imageCover', formData.imageCover);
    }
    
    // Add images if present
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((image) => {
        tourData.append('images', image);
      });
    }
    
    onSubmit(tourData);
  };

  return (
    <form className="form form--tour" onSubmit={handleSubmit}>
      <div className="form__group">
        <h2 className="heading-secondary ma-bt-md">{isEdit ? 'Edit Tour' : 'Create New Tour'}</h2>
      </div>
      
      <div className="form__group">
        <label className="form__label" htmlFor="name">Tour Name*</label>
        <input
          id="name"
          className="form__input"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="The Forest Hiker"
        />
      </div>

      <div className="form-row">
        <div className="form__group">
          <label className="form__label" htmlFor="duration">Duration (days)*</label>
          <input
            id="duration"
            className="form__input"
            type="number"
            name="duration"
            min="1"
            value={formData.duration}
            onChange={handleNumberChange}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="maxGroupSize">Max Group Size*</label>
          <input
            id="maxGroupSize"
            className="form__input"
            type="number"
            name="maxGroupSize"
            min="1"
            value={formData.maxGroupSize}
            onChange={handleNumberChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form__group">
          <label className="form__label" htmlFor="difficulty">Difficulty*</label>
          <select
            id="difficulty"
            className="form__input"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="price">Price*</label>
          <input
            id="price"
            className="form__input"
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handlePriceChange}
            required
          />
        </div>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="summary">Summary*</label>
        <input
          id="summary"
          className="form__input"
          type="text"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          required
          placeholder="Short description of the tour"
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="description">Description*</label>
        <textarea
          id="description"
          className="form__input"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Detailed description of the tour"
        />
      </div>

      <div className="form__group">
        <label className="form__label">Start Dates*</label>
        {formData.startDates.map((date, index) => (
          <div className="form-row" key={index}>
            <div className="form__group form__group--inline">
              <input
                className="form__input"
                type="date"
                value={date}
                onChange={(e) => handleStartDateChange(index, e.target.value)}
                required
              />
              {formData.startDates.length > 1 && (
                <button
                  type="button"
                  className="btn btn--small btn--red"
                  onClick={() => removeStartDate(index)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--small btn--green"
          onClick={addStartDate}
        >
          Add Date
        </button>
      </div>

      <div className="form__group">
        <h3 className="heading-tertiary ma-bt-sm">Start Location*</h3>
        <div className="form-row">
          <div className="form__group">
            <label className="form__label" htmlFor="startLocation.description">Description</label>
            <input
              id="startLocation.description"
              className="form__input"
              type="text"
              name="startLocation.description"
              value={formData.startLocation.description}
              onChange={handleChange}
              required
              placeholder="Miami, USA"
            />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="startLocation.address">Address</label>
            <input
              id="startLocation.address"
              className="form__input"
              type="text"
              name="startLocation.address"
              value={formData.startLocation.address}
              onChange={handleChange}
              required
              placeholder="301 Biscayne Blvd, Miami, FL 33132, USA"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form__group">
            <label className="form__label">Coordinates</label>
            <div className="form-row">
              <div className="form__group">
                <label className="form__label" htmlFor="startLocation.coordinates.0">Longitude</label>
                <input
                  id="startLocation.coordinates.0"
                  className="form__input"
                  type="number"
                  step="0.000001"
                  value={formData.startLocation.coordinates[0]}
                  onChange={(e) => handleStartLocationCoordinateChange(0, e.target.value)}
                  required
                />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="startLocation.coordinates.1">Latitude</label>
                <input
                  id="startLocation.coordinates.1"
                  className="form__input"
                  type="number"
                  step="0.000001"
                  value={formData.startLocation.coordinates[1]}
                  onChange={(e) => handleStartLocationCoordinateChange(1, e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form__group">
        <h3 className="heading-tertiary ma-bt-sm">Locations*</h3>
        {formData.locations.map((location, index) => (
          <div key={index} className="location-item">
            <h4 className="heading-quaternary">Location #{index + 1}</h4>
            <div className="form-row">
              <div className="form__group">
                <label className="form__label">Description</label>
                <input
                  className="form__input"
                  type="text"
                  value={location.description}
                  onChange={(e) => handleLocationChange(index, 'description', e.target.value)}
                  required
                  placeholder="Lummus Park Beach"
                />
              </div>
              <div className="form__group">
                <label className="form__label">Day</label>
                <input
                  className="form__input"
                  type="number"
                  min="1"
                  value={location.day}
                  onChange={(e) => handleLocationChange(index, 'day', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form__group">
                <label className="form__label">Coordinates</label>
                <div className="form-row">
                  <div className="form__group">
                    <label className="form__label">Longitude</label>
                    <input
                      className="form__input"
                      type="number"
                      step="0.000001"
                      value={location.coordinates[0]}
                      onChange={(e) => handleCoordinateChange(index, 0, e.target.value)}
                      required
                    />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Latitude</label>
                    <input
                      className="form__input"
                      type="number"
                      step="0.000001"
                      value={location.coordinates[1]}
                      onChange={(e) => handleCoordinateChange(index, 1, e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            {formData.locations.length > 1 && (
              <button
                type="button"
                className="btn btn--small btn--red"
                onClick={() => removeLocation(index)}
              >
                Remove Location
              </button>
            )}
            <div className="line">&nbsp;</div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--small btn--green"
          onClick={addLocation}
        >
          Add Location
        </button>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="imageCover">Cover Image {!isEdit && '*'}</label>
        <input
          id="imageCover"
          className="form__input form__input--file"
          type="file"
          accept="image/*"
          onChange={handleImageCoverChange}
          required={!isEdit}
        />
        {isEdit && initialData?.imageCover && (
          <div className="form__current-image">
            <p>Current cover image:</p>
            <img 
              src={`/img/tours/${initialData.imageCover}`} 
              alt="Current cover" 
              className="form__image-preview" 
            />
          </div>
        )}
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="images">Tour Images (up to 3)</label>
        <input
          id="images"
          className="form__input form__input--file"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          max="3"
        />
        {isEdit && initialData?.images && initialData.images.length > 0 && (
          <div className="form__current-images">
            <p>Current tour images:</p>
            <div className="form__images-preview">
              {initialData.images.map((image, i) => (
                <img 
                  key={i}
                  src={`/img/tours/${image}`} 
                  alt={`Tour ${i+1}`} 
                  className="form__image-preview" 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form__group form__group--buttons">
        <button
          type="button"
          className="btn btn--small btn--gray"
          onClick={() => navigate('/my-guide-tours')}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--small btn--green"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Tour' : 'Create Tour'}
        </button>
      </div>
    </form>
  );
};

export default TourForm;
