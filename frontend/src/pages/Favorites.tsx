import { Container, Typography, Grid, Box, Button } from '@mui/material'
import { Favorite, Pets } from '@mui/icons-material'
import { useFavorites } from '../hooks/useFavorites'
import PostCard from '../components/posts/PostCard'
import Loader from '../components/common/Loader'

const Favorites: React.FC = () => {
  const { favorites, loading } = useFavorites()

  if (loading) {
    return <Loader />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Favorite color="error" sx={{ mr: 2 }} />
        <Typography variant="h4" component="h1">
          Избранные объявления
        </Typography>
      </Box>

      {favorites.length === 0 ? (
        <Box textAlign="center" sx={{ py: 8 }}>
          <Pets sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет избранных объявлений
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Добавляйте объявления в избранное, чтобы не потерять их
          </Typography>
          <Button variant="contained" href="/">
            Найти питомцев
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Найдено избранных объявлений: {favorites.length}
          </Typography>
          <Grid container spacing={3}>
            {favorites.map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={4}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  )
}

export default Favorites