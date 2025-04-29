import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://14.225.217.42:5000/api', // API URL
  headers: {
    'Content-Type': 'application/json',
  },
})

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token') // Replace with your token retrieval logic
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => Promise.reject(error),
// )

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error.response?.data || error.message)
//     return Promise.reject(error)
//   },
// )

export default axiosInstance
