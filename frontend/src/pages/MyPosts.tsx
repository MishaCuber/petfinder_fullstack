import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import { Add, Edit, Delete, Visibility } from '@mui/icons-material'
import { RootState } from '../store'
import { fetchUserPosts, deletePost } from '../store/slices/postsSlice'
import Loader from '../components/common/Loader'

const MyPosts: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { posts, loading } = useSelector((state: RootState) => state.posts)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dispatch(fetchUserPosts() as any)
  }, [dispatch])

  const handleEdit = (id: string) => {
    navigate(`/edit-post/${id}`)
  }

  const handleView = (id: string) => {
    navigate(`/posts/${id}`)
  }

  const handleDeleteClick = (post: any) => {
    setSelectedPost(post)
    setDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedPost) {
      try {
        await dispatch(deletePost(selectedPost._id) as any)
        setDeleteDialog(false)
        setSelectedPost(null)
        // Обновляем список после удаления
        dispatch(fetchUserPosts() as any)
      } catch (error: any) {
        setError(error.payload || 'Ошибка при удалении объявления')
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog(false)
    setSelectedPost(null)
  }

  const getStatusColor = (type: string) => {
    return type === 'lost' ? 'error' : 'success'
  }

  const getStatusText = (type: string) => {
    return type === 'lost' ? 'Потерян' : 'Найден'
  }

  if (loading) {
    return <Loader />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Мои объявления
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-post')}
        >
          Создать объявление
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {posts.length === 0 ? (
        <Box textAlign="center" sx={{ py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            У вас пока нет объявлений
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-post')}
            sx={{ mt: 2 }}
          >
            Создать первое объявление
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item key={post._id} xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {post.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        <Chip
                          label={getStatusText(post.type)}
                          color={getStatusColor(post.type)}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {post.petType === 'cat' ? 'Кот' : post.petType === 'dog' ? 'Собака' : 'Другое'} • {post.breed}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {post.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Создано: {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleView(post._id)}
                  >
                    Просмотреть
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(post._id)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteClick(post)}
                  >
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить объявление "{selectedPost?.title}"? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MyPosts