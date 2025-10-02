import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useFormik } from 'formik'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  Alert,
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { RootState } from '../store'
import { usersAPI } from '../services/api'

const Profile: React.FC = () => {
  // const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setError('')
        const formData = new FormData()
        Object.entries(values).forEach(([key, value]) => {
          formData.append(key, value)
        })

        await usersAPI.updateProfile(formData)
        setMessage('Профиль успешно обновлен')
        // Здесь нужно обновить пользователя в store
      } catch (error: any) {
        setError(error.response?.data?.message || 'Ошибка при обновлении профиля')
      }
    },
  })

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Профиль пользователя
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Avatar
                sx={{ width: 100, height: 100 }}
                src={user?.avatar ? `http://localhost:5000/${user.avatar}` : ''}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Роль: {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Зарегистрирован: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : ''}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<EditIcon />}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Сохранение...' : 'Обновить профиль'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}

export default Profile