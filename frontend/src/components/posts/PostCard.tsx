import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  CardActions,
} from '@mui/material'
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material'
import { Post } from '../../types'
import { useFavorites } from '../../hooks/useFavorites'

interface PostCardProps {
  post: Post
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate()
  const { addFavorite, removeFavorite, checkFavorite } = useFavorites()
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkingFavorite, setCheckingFavorite] = useState(true)

  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const favoriteStatus = await checkFavorite(post._id)
        setIsFavorite(favoriteStatus)
      } catch (error) {
        console.error('Error checking favorite status:', error)
      } finally {
        setCheckingFavorite(false)
      }
    }

    checkIfFavorite()
  }, [post._id, checkFavorite])

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      if (isFavorite) {
        await removeFavorite(post._id)
        setIsFavorite(false)
      } else {
        await addFavorite(post._id)
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleCardClick = () => {
    navigate(`/posts/${post._id}`)
  }

  const getStatusColor = (status: string) => {
    return status === 'lost' ? 'error' : 'success'
  }

  const getStatusText = (status: string) => {
    return status === 'lost' ? 'Потерян' : 'Найден'
  }

  const getAnimalTypeText = (animalType: string) => {
    switch (animalType) {
      case 'cat': return 'Кот'
      case 'dog': return 'Собака'
      default: return 'Другое'
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
      onClick={handleCardClick}
    >
      {post.photos.length > 0 ? (
        <CardMedia
          component="img"
          height="200"
          image={`http://localhost:5000/${post.photos[0]}`}
          alt={post.title}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
          }}
        >
          <Typography color="text.secondary">Нет фото</Typography>
        </Box>
      )}
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" noWrap sx={{ flex: 1, mr: 1 }}>
            {post.title}
          </Typography>
          <Chip
            label={getStatusText(post.status)}
            color={getStatusColor(post.status)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {getAnimalTypeText(post.animalType)} • {post.breed}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {post.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarToday fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {new Date(post.dateLost).toLocaleDateString('ru-RU')}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {post.description.length > 100
            ? `${post.description.substring(0, 100)}...`
            : post.description}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {new Date(post.createdAt).toLocaleDateString('ru-RU')}
        </Typography>
        <IconButton 
          size="small" 
          onClick={handleFavoriteClick}
          disabled={checkingFavorite}
        >
          {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default PostCard