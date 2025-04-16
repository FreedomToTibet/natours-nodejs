import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
	console.log('Attempting to log in...');
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      // Redirect to the overview page after successful login
      window.setTimeout(() => {
        location.assign('/');
      }, 1500); // Redirect after 1.5 seconds
    }
  } catch (err) {
		showAlert('error', err.response.data.message);
    console.error('Login error:', err.response.data);
  }
};
