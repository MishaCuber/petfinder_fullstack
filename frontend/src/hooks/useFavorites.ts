import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { favoritesAPI } from '../services/api';

export const useFavorites = () => {
  // const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await favoritesAPI.getFavorites();
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addFavorite = useCallback(async (postId: string) => {
    try {
      await favoritesAPI.addFavorite(postId);
      await fetchFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (postId: string) => {
    try {
      await favoritesAPI.removeFavorite(postId);
      await fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }, [fetchFavorites]);

  const checkFavorite = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const response = await favoritesAPI.checkFavorite(postId);
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    checkFavorite,
    refreshFavorites: fetchFavorites
  };
};