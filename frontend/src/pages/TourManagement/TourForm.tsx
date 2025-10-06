import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tour } from '../../services';

interface TourFormData {
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  price: number;
  summary: string;
  description: string;
  imageCover: File | null;
  images: File[];
  startDates: string[];
  startLocation: {
    description: string;
    address: string;
    coordinates: [number, number];
  };
  locations: Array<{
    description: string;
    day: number;
    coordinates: [number, number];
  }>;
  guides: string[];
}

interface TourFormProps {
  initialData?: Tour;
  onSubmit: (tourData: FormData) => void;
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

  const [formData, setFormData] = useState<TourFormData>({
    name: '',
    duration: 1,
    maxGroupSize: 1,
    difficulty: 'easy',
    price: 100,
    summary: '',
    description: '',
    imageCover: null as File | null,
    images: [] as File[],
    startDates: [''] as string[],
    startLocation: {
      description: '',
      address: '',
      coordinates: [-80.185942, 25.774772] // Default Miami coordinates
    },
    locations: [{
      description: '',
      day: 1,
      coordinates: [-80.185942, 25.774772] // Default Miami coordinates
    }],
    guides: [''] as string[] // Initialize with one empty guide field
  });

  useEffect(() => {
    if (initialData) {
      // Map the initial data to formData
      setFormData({
        name: initialData.name,
        duration: initialData.duration,
        maxGroupSize: initialData.maxGroupSize,
        difficulty: initialData.difficulty,
        price: initialData.price,
        summary: initialData.summary,
        description: initialData.description,
        imageCover: null,
        images: [],
        startDates: initialData.startDates.map(date => 
          new Date(date).toISOString().split('T')[0]
        ),
        startLocation: {
          description: initialData.startLocation.description,
          address: initialData.startLocation.address || '',
          coordinates: initialData.startLocation.coordinates
        },
        locations: initialData.locations.map(location => ({
          description: location.description,
          day: location.day,
          coordinates: location.coordinates
        })),
        guides: initialData.guides?.map(guide => {
          // If guide is an object with an email, use that, otherwise use the ID
          if (typeof guide === 'object' && guide !== null) {
            // Always prefer email when available since we're using emails as identifiers
            console.log('Guide object:', guide);
            return guide.email || ''; // Return email or empty string if no email
          }
          // If it's just a string (already an ID), console log and return empty
          console.log('Guide ID (should not happen):', guide);
          return ''; // Return empty since we want emails not IDs
        }) || [''] // If no guides, add one empty field
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like startLocation.description
      const [parent, child] = name.split('.');
      setFormData(prev => {
        if (parent === 'startLocation') {
          return {
            ...prev,
            startLocation: {
              ...prev.startLocation,
              [child]: value
            }
          };
        }
        return prev;
      });
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
      newLocations[index] = { 
        ...newLocations[index], 
        [field]: field === 'day' ? parseInt(value as string, 10) : value 
      };
      return { ...prev, locations: newLocations };
    });
  };

  const handleCoordinateChange = (index: number, coordIndex: number, value: string) => {
    setFormData(prev => {
      const newLocations = [...prev.locations];
      const newCoords: [number, number] = [...newLocations[index].coordinates];
      newCoords[coordIndex] = parseFloat(value);
      newLocations[index] = { ...newLocations[index], coordinates: newCoords };
      return { ...prev, locations: newLocations };
    });
  };

  const handleStartLocationCoordinateChange = (coordIndex: number, value: string) => {
    setFormData(prev => {
      const newStartLocation = { ...prev.startLocation };
      const newCoords: [number, number] = [...newStartLocation.coordinates];
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
  
  // Handler functions for guides
  const handleGuideChange = (index: number, value: string) => {
    setFormData(prev => {
      const newGuides = [...prev.guides];
      newGuides[index] = value;
      return { ...prev, guides: newGuides };
    });
  };

  const addGuide = () => {
    setFormData(prev => ({
      ...prev,
      guides: [...prev.guides, '']
    }));
  };

  const removeGuide = (index: number) => {
    setFormData(prev => {
      const newGuides = [...prev.guides];
      newGuides.splice(index, 1);
      return { ...prev, guides: newGuides };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for required fields
    if (!formData.name.trim()) {
      alert('Tour name is required');
      return;
    }
    if (!formData.summary.trim()) {
      alert('Tour summary is required');
      return;
    }
    if (!formData.description.trim()) {
      alert('Tour description is required');
      return;
    }
    if (!formData.startLocation.description.trim()) {
      alert('Start location description is required');
      return;
    }
    if (!formData.startLocation.address.trim()) {
      alert('Start location address is required');
      return;
    }
    if (!isEdit && !formData.imageCover) {
      alert('Cover image is required for new tours');
      return;
    }
    if (formData.startDates.filter(date => date.trim()).length === 0) {
      alert('At least one start date is required');
      return;
    }
    
    // Validate guides for new tours (at least one guide is required)
    const validGuides = formData.guides.filter(guide => guide.trim());
    if (!isEdit && validGuides.length === 0) {
      alert('At least one guide is required. Please enter a guide email.');
      return;
    }
    
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
    
    // Create startLocation object and stringify it
    const startLocation = {
      type: 'Point',
      description: formData.startLocation.description,
      address: formData.startLocation.address,
      coordinates: [
        formData.startLocation.coordinates[0],
        formData.startLocation.coordinates[1]
      ]
    };
    
    // Add start location as JSON string
    tourData.append('startLocation', JSON.stringify(startLocation));
    
    // Create locations array and stringify it
    const locations = formData.locations.map(location => ({
      type: 'Point',
      description: location.description,
      day: location.day,
      coordinates: [
        location.coordinates[0],
        location.coordinates[1]
      ]
    }));
    
    // Add locations as JSON string
    tourData.append('locations', JSON.stringify(locations));
    
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
    
    // Debug: Log form data
    console.log('Submitting tour data:');
    for (const pair of tourData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
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
          style={{ resize: 'none' }}
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
        <h3 className="heading-tertiary ma-bt-sm">Tour Guides*</h3>
        <p className="form__helper-text">Add at least one guide by email. You'll be added automatically as the lead guide.</p>
        
        {formData.guides.map((guide, index) => (
          <div className="form-row" key={index}>
            <div className="form__group form__group--inline">
              <input
                className="form__input"
                type="email"
                placeholder="Guide email (e.g., guide@example.com)"
                value={guide}
                onChange={(e) => handleGuideChange(index, e.target.value)}
                required={!isEdit} // Required for new tours
              />
              {formData.guides.length > 1 && (
                <button
                  type="button"
                  className="btn btn--small btn--red"
                  onClick={() => removeGuide(index)}
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
          onClick={addGuide}
        >
          Add Guide
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
            <div className="image-container">
              <img 
                src={`/img/tours/${initialData.imageCover}`} 
                alt="Current cover" 
                className="form__image-preview" 
              />
              {formData.imageCover && (
                <div className="new-image-preview">
                  <p>New image to upload:</p>
                  <img 
                    src={URL.createObjectURL(formData.imageCover)} 
                    alt="New cover preview" 
                    className="form__image-preview" 
                  />
                </div>
              )}
            </div>
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
        {formData.images && formData.images.length > 0 && (
          <div className="form__current-images">
            <p>New images to upload:</p>
            <div className="form__images-preview">
              {Array.from(formData.images).map((image, i) => (
                <img 
                  key={i}
                  src={URL.createObjectURL(image)} 
                  alt={`New tour image ${i+1}`} 
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
