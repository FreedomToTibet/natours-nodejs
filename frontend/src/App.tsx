import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import GlobalStyles from './styles';
import AppLayout, { ProtectedRoute } from './components';
import { Overview, Tour, Login, Signup, Account, MyTours, MyGuideTours, AllReviews, GuideAvailability, NotFound, Booking, BookingManage, ForgotPassword, ResetPassword, CreateTour, EditTour, AdminDashboard } from './pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 429 (rate limit) or auth errors
        if (error?.response?.status === 429 || error?.response?.status === 401) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <GlobalStyles />
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/tour/:slug" element={<Tour />} />
            <Route path="/booking/:slug" element={<Booking />} />
            <Route path="/booking-manage/:bookingId" element={<BookingManage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/me" element={<Account />} />
            <Route path="/account" element={<Account />} />
            <Route path="/my-tours" element={<MyTours />} />
            <Route path="/my-guide-tours" element={<MyGuideTours />} />
            
            {/* Protected routes for guides and above */}
            <Route element={<ProtectedRoute allowedRoles={['guide', 'lead-guide', 'admin']} />}>
              <Route path="/all-reviews" element={<AllReviews />} />
              <Route path="/manage-availability" element={<GuideAvailability />} />
            </Route>
            
            {/* Protected routes for lead-guides */}
            <Route element={<ProtectedRoute allowedRoles={['lead-guide', 'admin']} />}>
              <Route path="/tours/create" element={<CreateTour />} />
              <Route path="/tours/edit/:id" element={<EditTour />} />
            </Route>

            {/* Admin-only routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
				toastStyle={{ 
					color: '#55c57a',
					fontSize: '1.6rem',
					fontWeight: '600',
					backgroundColor: '#FFFFFF',
				}}
      />
    </QueryClientProvider>
  );
}

export default App;
