import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TourForm from './TourForm';
import { useTourById, useUpdateTour } from '../../hooks';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditTour = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tour, isLoading: tourLoading, error } = useTourById(id || '');
  const updateTourMutation = useUpdateTour();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error('Error loading tour. Please try again.');
      navigate('/my-guide-tours');
    }
  }, [error, navigate]);

  const handleSubmit = async (tourData: FormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      await updateTourMutation.mutateAsync({ id, data: tourData });
      toast.success('Tour updated successfully!');
      navigate('/my-guide-tours');
    } catch (error) {
      console.error('Error updating tour:', error);
      setIsSubmitting(false);
      // Error is handled by the mutation
    }
  };

  if (tourLoading || !tour) {
    return <LoadingSpinner />;
  }

  return (
    <div className="main">
      <div className="tour-form-container">
        <TourForm
          initialData={tour}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default EditTour;
