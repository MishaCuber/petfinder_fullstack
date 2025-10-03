import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Pagination,
} from '@mui/material'
import { RootState } from '../store'
import { fetchPosts } from '../store/slices/postsSlice'
import PostCard from '../components/posts/PostCard'
import Loader from '../components/common/Loader'

const Home: React.FC = () => {
  const dispatch = useDispatch()
  const { posts, loading, totalPages, currentPage, total } = useSelector(
    (state: RootState) => state.posts
  )

  const [filters, setFilters] = useState({
    petType: '',
    location: '',
    breed: '',
    type: '',
    page: 1,
    limit: 9,
  })

  useEffect(() => {
    dispatch(fetchPosts(filters) as any)
  }, [dispatch, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setFilters(prev => ({ ...prev, page: value }))
  }

  if (loading) {
    return <Loader />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Найди своего питомца
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Тип животного</InputLabel>
              <Select
                value={filters.petType}
                label="Тип животного"
                onChange={(e) => handleFilterChange('petType', e.target.value)}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="cat">Коты</MenuItem>
                <MenuItem value="dog">Собаки</MenuItem>
                <MenuItem value="other">Другие</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Порода"
              value={filters.breed}
              onChange={(e) => handleFilterChange('breed', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Локация"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={filters.type}
                label="Статус"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="lost">Потерян</MenuItem>
                <MenuItem value="found">Найден</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Typography variant="h6" textAlign="center" color="text.secondary">
          Объявления не найдены
        </Typography>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Найдено объявлений: {total}
          </Typography>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={4}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default Home