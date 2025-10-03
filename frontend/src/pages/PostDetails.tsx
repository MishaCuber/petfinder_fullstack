import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Card,
  CardMedia,
  Divider,
  IconButton,
  TextField,
  Alert,
} from '@mui/material'
import {
  Favorite,
  FavoriteBorder,
  Edit,
  Delete,
  ArrowBack,
  LocationOn,
  CalendarToday,
  Phone,
  Person,
} from '@mui/icons-material'
import { RootState } from '../store'
import { fetchPost, deletePost } from '../store/slices/postsSlice'
import { fetchComments, createComment } from '../store/slices/commentsSlice'
import Loader from '../components/common/Loader'
import { useAuth } from '../hooks/useAuth'

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { currentPost, loading } = useSelector((state: RootState) => state.posts)
  const { comments } = useSelector((state: RootState) => state.comments)
  const [isFavorite, setIsFavorite] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      dispatch(fetchPost(id) as any)
      dispatch(fetchComments(id) as any)
    }
  }, [dispatch, id])

  const handleDelete = async () => {
    if (id && window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      try {
        await dispatch(deletePost(id) as any)
        navigate('/')
      } catch (error) {
        setError('Ошибка при удалении объявления')
      }
    }
  }

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite)
    // Здесь будет логика добавления/удаления из избранного
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !id) return

    try {
      await dispatch(createComment({ postId: id, content: commentText }) as any)
      setCommentText('')
    } catch (error) {
      setError('Ошибка при добавлении комментария')
    }
  }

  if (loading || !currentPost) {
    return <Loader />
  }

  const isAuthor = user?.id === currentPost.author.id

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Назад
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {currentPost.title}
              </Typography>
              <Chip
                label={currentPost.type === 'lost' ? 'Потерян' : 'Найден'}
                color={currentPost.type === 'lost' ? 'error' : 'success'}
              />
            </Box>

            {/* Фотографии */}
            {currentPost.photos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  {currentPost.photos.map((photo, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="200"
                          image={`http://localhost:5000/${photo}`}
                          alt={`Фото ${index + 1}`}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Информация о животном */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Информация о животном
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Вид:</strong> {
                    currentPost.petType === 'cat' ? 'Кот' : 
                    currentPost.petType === 'dog' ? 'Собака' : 'Другое'
                  }</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Порода:</strong> {currentPost.breed}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1 }} />
                    <Typography><strong>Локация:</strong> {currentPost.location}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1 }} />
                    <Typography>
                      <strong>Дата создания:</strong> {new Date(currentPost.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Описание */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Описание
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {currentPost.description}
              </Typography>
            </Box>

            {/* Действия */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={handleFavoriteClick}>
                {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
              {isAuthor && (
                <>
                  <Button
                    startIcon={<Edit />}
                    onClick={() => navigate(`/edit-post/${currentPost._id}`)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    startIcon={<Delete />}
                    color="error"
                    onClick={handleDelete}
                  >
                    Удалить
                  </Button>
                </>
              )}
            </Box>
          </Paper>

          {/* Комментарии */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Комментарии ({comments.length})
            </Typography>

            {/* Форма комментария */}
            {user && (
              <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Оставьте комментарий..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button type="submit" variant="contained">
                  Отправить
                </Button>
              </Box>
            )}

            {/* Список комментариев */}
            {comments.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">
                Комментариев пока нет
              </Typography>
            ) : (
              comments.map((comment) => (
                <Box key={comment._id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1 }} />
                      {comment.author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{comment.content}</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Боковая панель - контакты */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom>
              Контактная информация
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1 }} />
                <Typography><strong>Автор:</strong> {currentPost.author.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1 }} />
                <Typography><strong>Контакт:</strong> {currentPost.contactInfo}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Объявление создано: {new Date(currentPost.createdAt).toLocaleDateString('ru-RU')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PostDetails