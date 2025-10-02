import * as Yup from 'yup';

export const loginValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string().required('Required'),
});

export const registerValidationSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
  phone: Yup.string().required('Required'),
});

export const postValidationSchema = Yup.object({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  animalType: Yup.string().oneOf(['cat', 'dog', 'other']).required('Required'),
  breed: Yup.string().required('Required'),
  location: Yup.string().required('Required'),
  dateLost: Yup.date().required('Required'),
  contactPhone: Yup.string().required('Required'),
  status: Yup.string().oneOf(['lost', 'found']).required('Required'),
});