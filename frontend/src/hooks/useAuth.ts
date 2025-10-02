import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { getMe } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated && !user) {
      dispatch(getMe() as any);
    }
  }, [dispatch, isAuthenticated, user]);

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    if (user?.role !== 'admin') {
      navigate('/');
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    user,
    loading,
    requireAuth,
    requireAdmin,
  };
};