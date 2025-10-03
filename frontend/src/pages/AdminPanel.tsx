import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material'
import {
  Delete,
  AdminPanelSettings,
  Block,
  Person,
  ArticleOutlined,
  Assessment,
  SupervisorAccount,
  LockOpen,
  Search,
  FilterList,
  Download,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { adminAPI } from '../services/api'
import { User, Post, Comment as CommentType } from '../types'

interface Stats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  postsByType: Array<{ _id: string; count: number }>
  postsByStatus: Array<{ _id: string; count: number }>
  postsByPetType: Array<{ _id: string; count: number }>
  userGrowth: Array<{ _id: { year: number; month: number }; count: number }>
  postGrowth: Array<{ _id: { year: number; month: number }; count: number }>
  commentGrowth?: Array<{ _id: { year: number; month: number }; count: number }>
  recentUsers: User[]
  recentPosts: Post[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<CommentType[]>([])
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: () => {} })
  
  // Поиск и фильтрация
  const [userSearch, setUserSearch] = useState('')
  const [postSearch, setPostSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [postStatusFilter, setPostStatusFilter] = useState('all')
  const [userPage, setUserPage] = useState(1)
  const [postPage, setPostPage] = useState(1)
  const itemsPerPage = 10
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsResponse, usersResponse, postsResponse, commentsResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getPosts(),
        adminAPI.getComments()
      ])
      setStats(statsResponse.data)
      // Нормализуем пользователей: приводим _id -> id
      const normalizedUsers = (usersResponse.data || []).map((u: any) => ({
        ...u,
        id: u.id || u._id,
      }))
      setUsers(normalizedUsers)
      setPosts(postsResponse.data)
      setComments(commentsResponse.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      showSnackbar('Ошибка загрузки данных', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter
    return matchesSearch && matchesRole
  })

  // Фильтрация постов
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(postSearch.toLowerCase()) ||
                         post.description.toLowerCase().includes(postSearch.toLowerCase())
    const matchesStatus = postStatusFilter === 'all' || post.status === postStatusFilter
    return matchesSearch && matchesStatus
  })

  // Пагинация
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  )
  const paginatedPosts = filteredPosts.slice(
    (postPage - 1) * itemsPerPage,
    postPage * itemsPerPage
  )

  // Данные для графиков
  const chartData = stats?.userGrowth.map(item => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    users: item.count
  })) || []

  const postChartData = stats?.postGrowth.map(item => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    posts: item.count
  })) || []

  const commentChartData = stats?.commentGrowth?.map(item => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    comments: item.count
  })) || []

  const petTypeData = stats?.postsByPetType.map(item => ({
    name: item._id,
    value: item.count
  })) || []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // Функция экспорта данных в CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      showSnackbar('Нет данных для экспорта', 'error')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showSnackbar(`Данные экспортированы в ${filename}.csv`, 'success')
  }

  const handleExportUsers = () => {
    const userData = filteredUsers.map(user => ({
      'Имя': user.name,
      'Email': user.email,
      'Телефон': user.phone || '',
      'Роль': user.role === 'admin' ? 'Администратор' : 'Пользователь',
      'Статус': user.isBlocked ? 'Заблокирован' : 'Активен',
      'Дата регистрации': new Date(user.createdAt).toLocaleDateString('ru-RU')
    }))
    exportToCSV(userData, 'users')
  }

  const handleExportPosts = () => {
    const postData = filteredPosts.map(post => ({
      'Заголовок': post.title,
      'Автор': post.author?.name || 'Неизвестно',
      'Тип': post.type === 'lost' ? 'Потерян' : 'Найден',
      'Статус': post.status === 'active' ? 'Активен' : 
                post.status === 'resolved' ? 'Решен' : 'Закрыт',
      'Тип животного': post.petType,
      'Порода': post.breed || '',
      'Дата создания': new Date(post.createdAt).toLocaleDateString('ru-RU')
    }))
    exportToCSV(postData, 'posts')
  }

  // Массовые действия
  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleBulkBlockUsers = async (block: boolean) => {
    try {
      await Promise.all(
        selectedUsers.map(userId => adminAPI.blockUser(userId, block))
      )
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) ? { ...user, isBlocked: block } : user
      ))
      setSelectedUsers([])
      showSnackbar(
        `Пользователи ${block ? 'заблокированы' : 'разблокированы'}`, 
        'success'
      )
    } catch (error) {
      console.error('Error bulk blocking users:', error)
      showSnackbar('Ошибка при изменении статуса пользователей', 'error')
    }
  }

  const handleBulkDeleteUsers = async () => {
    setConfirmDialog({
      open: true,
      title: 'Массовое удаление пользователей',
      message: `Вы уверены, что хотите удалить ${selectedUsers.length} пользователей? Это действие нельзя отменить.`,
      action: async () => {
        try {
          await Promise.all(
            selectedUsers.map(userId => adminAPI.deleteUser(userId))
          )
          setUsers(users.filter(user => !selectedUsers.includes(user.id)))
          setSelectedUsers([])
          showSnackbar('Пользователи успешно удалены', 'success')
        } catch (error) {
          console.error('Error bulk deleting users:', error)
          showSnackbar('Ошибка при удалении пользователей', 'error')
        }
        setConfirmDialog({ ...confirmDialog, open: false })
      }
    })
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Удаление пользователя',
      message: `Вы уверены, что хотите удалить пользователя "${userName}"? Это действие нельзя отменить.`,
      action: async () => {
        try {
          await adminAPI.deleteUser(userId)
          setUsers(users.filter(user => (user.id || (user as any)._id) !== userId))
          showSnackbar('Пользователь успешно удален', 'success')
        } catch (error) {
          console.error('Error deleting user:', error)
          showSnackbar('Ошибка при удалении пользователя', 'error')
        }
        setConfirmDialog({ ...confirmDialog, open: false })
      }
    })
  }

  const handleBlockUser = async (userId: string, isBlocked: boolean, userName: string) => {
    try {
      await adminAPI.blockUser(userId, isBlocked)
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked } : user
      ))
      showSnackbar(
        `Пользователь "${userName}" ${isBlocked ? 'заблокирован' : 'разблокирован'}`,
        'success'
      )
    } catch (error) {
      console.error('Error blocking user:', error)
      showSnackbar('Ошибка при изменении статуса пользователя', 'error')
    }
  }

  const handleChangeUserRole = async (userId: string, newRole: string, userName: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole)
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as 'user' | 'admin' } : user
      ))
      showSnackbar(`Роль пользователя "${userName}" изменена на ${newRole}`, 'success')
    } catch (error) {
      console.error('Error updating user role:', error)
      showSnackbar('Ошибка при изменении роли пользователя', 'error')
    }
  }

  const handleDeletePost = async (postId: string, postTitle: string) => {
    setConfirmDialog({
      open: true,
      title: 'Удаление поста',
      message: `Вы уверены, что хотите удалить пост "${postTitle}"? Это действие нельзя отменить.`,
      action: async () => {
        try {
          await adminAPI.deletePost(postId)
          setPosts(posts.filter(post => post._id !== postId))
          showSnackbar('Пост успешно удален', 'success')
        } catch (error) {
          console.error('Error deleting post:', error)
          showSnackbar('Ошибка при удалении поста', 'error')
        }
        setConfirmDialog({ ...confirmDialog, open: false })
      }
    })
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    )
  }

  if (!stats) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Ошибка загрузки данных</Alert>
      </Container>
    )
  }

  const renderStatistics = () => (
    <>
      {/* Основная статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <Person sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="inherit" gutterBottom>
                    Пользователи
                  </Typography>
                  <Typography variant="h4" color="inherit">
                    {stats.totalUsers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <ArticleOutlined sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="inherit" gutterBottom>
                    Объявления
                  </Typography>
                  <Typography variant="h4" color="inherit">
                    {stats.totalPosts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <Assessment sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="inherit" gutterBottom>
                    Комментарии
                  </Typography>
                  <Typography variant="h4" color="inherit">
                    {stats.totalComments}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <SupervisorAccount sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="inherit" gutterBottom>
                    Активные посты
                  </Typography>
                  <Typography variant="h4" color="inherit">
                    {stats.postsByStatus.find(s => s._id === 'active')?.count || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Графики и диаграммы */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Рост пользователей
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Рост объявлений
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={postChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="posts" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Рост комментариев
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={commentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="comments" stroke="#ff9800" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Популярные типы животных
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={petTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {petTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Статус объявлений
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.postsByStatus.map(item => ({
                name: item._id === 'active' ? 'Активные' : 
                      item._id === 'resolved' ? 'Решенные' : 'Закрытые',
                count: item.count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Последние активности */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Новые пользователи
            </Typography>
            <Table size="small">
              <TableBody>
                {stats.recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Последние объявления
            </Typography>
            <Table size="small">
              <TableBody>
                {stats.recentPosts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={post.type === 'lost' ? 'Потерян' : 'Найден'} 
                        color={post.type === 'lost' ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </>
  )

  const renderUsers = () => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Управление пользователями ({filteredUsers.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Поиск пользователей..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              startAdornment={<FilterList />}
            >
              <MenuItem value="all">Все роли</MenuItem>
              <MenuItem value="user">Пользователи</MenuItem>
              <MenuItem value="admin">Администраторы</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportUsers}
            size="small"
          >
            Экспорт
          </Button>
        </Box>
      </Box>
      
      {selectedUsers.length > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Выбрано пользователей: {selectedUsers.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleBulkBlockUsers(true)}
              startIcon={<Block />}
            >
              Заблокировать
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleBulkBlockUsers(false)}
              startIcon={<LockOpen />}
            >
              Разблокировать
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleBulkDeleteUsers}
              startIcon={<Delete />}
            >
              Удалить
            </Button>
          </Box>
        </Box>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={(e) => handleSelectAllUsers(e.target.checked)}
                />
              </TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата регистрации</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '—'}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={user.role}
                      onChange={(e) => handleChangeUserRole(user.id, e.target.value, user.name)}
                      disabled={user.role === 'admin'}
                    >
                      <MenuItem value="user">Пользователь</MenuItem>
                      <MenuItem value="admin">Админ</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isBlocked ? 'Заблокирован' : 'Активен'}
                    color={user.isBlocked ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {user.role !== 'admin' && (
                      <>
                        <IconButton
                          color={user.isBlocked ? 'success' : 'warning'}
                          onClick={() => handleBlockUser(user.id, !user.isBlocked, user.name)}
                          title={user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                        >
                          {user.isBlocked ? <LockOpen /> : <Block />}
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          title="Удалить пользователя"
                        >
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredUsers.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredUsers.length / itemsPerPage)}
            page={userPage}
            onChange={(_, page) => setUserPage(page)}
            color="primary"
          />
        </Box>
      )}
    </Paper>
  )

  const renderPosts = () => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Управление объявлениями ({filteredPosts.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Поиск объявлений..."
            value={postSearch}
            onChange={(e) => setPostSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={postStatusFilter}
              onChange={(e) => setPostStatusFilter(e.target.value)}
              startAdornment={<FilterList />}
            >
              <MenuItem value="all">Все статусы</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
              <MenuItem value="resolved">Решенные</MenuItem>
              <MenuItem value="closed">Закрытые</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportPosts}
            size="small"
          >
            Экспорт
          </Button>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Заголовок</TableCell>
              <TableCell>Автор</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPosts.map((post) => (
              <TableRow key={post._id}>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {post.title}
                  </Typography>
                </TableCell>
                <TableCell>{post.author?.name || 'Неизвестно'}</TableCell>
                <TableCell>
                  <Chip
                    label={post.type === 'lost' ? 'Потерян' : 'Найден'}
                    color={post.type === 'lost' ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={post.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value as 'active' | 'resolved' | 'closed'
                        try {
                          const { data } = await adminAPI.updatePostStatus(post._id, newStatus)
                          setPosts(posts.map(p => p._id === post._id ? data : p))
                          showSnackbar('Статус поста обновлен', 'success')
                        } catch (err) {
                          showSnackbar('Ошибка обновления статуса', 'error')
                        }
                      }}
                    >
                      <MenuItem value="active">Активен</MenuItem>
                      <MenuItem value="resolved">Решен</MenuItem>
                      <MenuItem value="closed">Закрыт</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setEditPost(post)}
                    >
                      Редактировать
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleDeletePost(post._id, post.title)}
                      title="Удалить пост"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredPosts.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredPosts.length / itemsPerPage)}
            page={postPage}
            onChange={(_, page) => setPostPage(page)}
            color="primary"
          />
        </Box>
      )}
    </Paper>
  )

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <AdminPanelSettings sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Панель администратора
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab 
            icon={<Assessment />} 
            label="Статистика" 
            iconPosition="start"
          />
          <Tab 
            icon={
              <Badge badgeContent={users.length} color="primary">
                <Person />
              </Badge>
            } 
            label="Пользователи" 
            iconPosition="start"
          />
          <Tab 
            icon={
              <Badge badgeContent={posts.length} color="primary">
                <ArticleOutlined />
              </Badge>
            } 
            label="Объявления" 
            iconPosition="start"
          />
          <Tab 
            icon={
              <Badge badgeContent={comments.length} color="primary">
                <Assessment />
              </Badge>
            } 
            label="Комментарии" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderStatistics()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderUsers()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderPosts()}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Модерация комментариев ({comments.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Текст</TableCell>
                  <TableCell>Автор</TableCell>
                  <TableCell>Пост</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comments.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 400 }}>
                        {c.content}
                      </Typography>
                    </TableCell>
                    <TableCell>{(c as any)?.author?.name || '—'}</TableCell>
                    <TableCell>{(c as any)?.post?.title || '—'}</TableCell>
                    <TableCell>{new Date(c.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={async () => {
                          try {
                            await adminAPI.deleteComment(c._id)
                            setComments(comments.filter(x => x._id !== c._id))
                            showSnackbar('Комментарий удален', 'success')
                          } catch (err) {
                            showSnackbar('Ошибка при удалении комментария', 'error')
                          }
                        }}
                        title="Удалить комментарий"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Диалог подтверждения */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            Отмена
          </Button>
          <Button 
            onClick={confirmDialog.action} 
            color="error" 
            variant="contained"
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Редактирование поста */}
      <Dialog open={!!editPost} onClose={() => setEditPost(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактирование поста</DialogTitle>
        <DialogContent>
          {editPost && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Заголовок"
                value={editPost.title}
                onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Описание"
                value={editPost.description}
                onChange={(e) => setEditPost({ ...editPost, description: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
              <TextField
                label="Локация"
                value={editPost.location}
                onChange={(e) => setEditPost({ ...editPost, location: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth size="small">
                <Select
                  value={editPost.type}
                  onChange={(e) => setEditPost({ ...editPost, type: e.target.value as any })}
                >
                  <MenuItem value="lost">Потерян</MenuItem>
                  <MenuItem value="found">Найден</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPost(null)}>Отмена</Button>
          <Button
            variant="contained"
            disabled={editSaving}
            onClick={async () => {
              if (!editPost) return
              try {
                setEditSaving(true)
                const payload = {
                  title: editPost.title,
                  description: editPost.description,
                  location: editPost.location,
                  type: editPost.type,
                }
                const { data } = await adminAPI.updatePost(editPost._id, payload)
                setPosts(posts.map(p => p._id === data._id ? data : p))
                showSnackbar('Пост сохранен', 'success')
                setEditPost(null)
              } catch (e) {
                showSnackbar('Ошибка сохранения поста', 'error')
              } finally {
                setEditSaving(false)
              }
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default AdminPanel