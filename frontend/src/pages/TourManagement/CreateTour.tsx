import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TourForm from './TourForm';
import { useCreateTour } from '../../hooks';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateTour = () => {
  const navigate = useNavigate();
  const createTourMutation = useCreateTour();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (tourData: FormData) => {
    setIsSubmitting(true);
    
    try {
      await createTourMutation.mutateAsync(tourData);
      toast.success('Tour created successfully!');
      navigate('/my-guide-tours');
    } catch (error) {
      console.error('Error creating tour:', error);
      setIsSubmitting(false);
      // Error is handled by the mutation
    }
  };

  if (createTourMutation.isPending && !isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <div className="main">
      <div className="tour-form-container">
        <TourForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          isEdit={false}
        />
      </div>
    </div>
  );
};

export default CreateTour;
