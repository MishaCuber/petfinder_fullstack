import { Box, Container, Typography, Link } from '@mui/material'

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          <Link color="inherit" href="/">
            PetFinder
          </Link>{' '}
          {new Date().getFullYear()}
          {'. Помогаем питомцам найти дом.'}
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer