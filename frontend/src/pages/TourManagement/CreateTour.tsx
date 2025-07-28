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
      console.log('Submitting tour data...');
      // Log form data for debugging
      for (const pair of tourData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      
      await createTourMutation.mutateAsync(tourData);
      navigate('/my-guide-tours');
    } catch (error: unknown) {
      console.error('Error creating tour:', error);
      
      // Show more detailed error message
      if (error && typeof error === 'object') {
        if ('response' in error && 
            error.response && 
            typeof error.response === 'object' && 
            'data' in error.response && 
            error.response.data && 
            typeof error.response.data === 'object' &&
            'message' in error.response.data) {
          toast.error(`Error: ${error.response.data.message}`);
        } else if ('message' in error && typeof error.message === 'string') {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error('An unknown error occurred while creating the tour');
        }
      } else {
        toast.error('An unknown error occurred while creating the tour');
      }
      setIsSubmitting(false);
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
