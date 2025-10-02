import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Alert,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { RootState } from '../store'
import { createPost, updatePost, fetchPost } from '../store/slices/postsSlice'
import { postValidationSchema } from '../utils/validationSchemas'

const CreatePost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentPost } = useSelector((state: RootState) => state.posts)
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')

  const isEdit = Boolean(id)

  useEffect(() => {
    if (id && !currentPost) {
      dispatch(fetchPost(id) as any)
    }
  }, [dispatch, id, currentPost])

  useEffect(() => {
    if (isEdit && currentPost) {
      formik.setValues({
        title: currentPost.title,
        description: currentPost.description,
        animalType: currentPost.animalType,
        breed: currentPost.breed,
        location: currentPost.location,
        dateLost: currentPost.dateLost.split('T')[0],
        contactPhone: currentPost.contactPhone,
        status: currentPost.status,
      })
    }
  }, [isEdit, currentPost])

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      animalType: '',
      breed: '',
      location: '',
      dateLost: '',
      contactPhone: '',
      status: 'lost',
    },
    validationSchema: postValidationSchema,
    onSubmit: async (values) => {
      try {
        setError('')
        const formData = new FormData()
        
        Object.entries(values).forEach(([key, value]) => {
          formData.append(key, value)
        })

        photos.forEach(photo => {
          formData.append('photos', photo)
        })

        if (isEdit && id) {
          await dispatch(updatePost({ id, postData: formData }) as any)
        } else {
          await dispatch(createPost(formData) as any)
        }
        
        navigate(isEdit ? `/posts/${id}` : '/')
      } catch (error: any) {
        setError(error.payload || 'Произошла ошибка')
      }
    },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files)
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)) // Максимум 5 фото
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? 'Редактировать объявление' : 'Создать объявление'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Заголовок"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Описание"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Тип животного</InputLabel>
                <Select
                  name="animalType"
                  value={formik.values.animalType}
                  label="Тип животного"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.animalType && Boolean(formik.errors.animalType)}
                >
                  <MenuItem value="cat">Кот</MenuItem>
                  <MenuItem value="dog">Собака</MenuItem>
                  <MenuItem value="other">Другое</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Порода"
                name="breed"
                value={formik.values.breed}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.breed && Boolean(formik.errors.breed)}
                helperText={formik.touched.breed && formik.errors.breed}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Локация"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Дата пропажи/находки"
                name="dateLost"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.dateLost}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dateLost && Boolean(formik.errors.dateLost)}
                helperText={formik.touched.dateLost && formik.errors.dateLost}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Контактный телефон"
                name="contactPhone"
                value={formik.values.contactPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactPhone && Boolean(formik.errors.contactPhone)}
                helperText={formik.touched.contactPhone && formik.errors.contactPhone}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  label="Статус"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="lost">Потерян</MenuItem>
                  <MenuItem value="found">Найден</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                Загрузить фото
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Максимум 5 фото
              </Typography>

              <Box sx={{ mt: 2 }}>
                {photos.map((photo, index) => (
                  <Chip
                    key={index}
                    label={photo.name}
                    onDelete={() => removePhoto(index)}
                    deleteIcon={<DeleteIcon />}
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}

export default CreatePost