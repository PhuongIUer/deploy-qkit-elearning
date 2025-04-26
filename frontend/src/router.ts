import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from './store/auth'

// Route groups
const publicRoutes: Array<RouteRecordRaw> = [
  {
    path: '',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ './views/HomePage.vue'),
    meta: { title: 'Home' },
  },
  {
    path: 'courses',
    name: 'courses',
    component: () => import(/* webpackChunkName: "courses" */ './views/CoursesPage.vue'),
    meta: { title: 'Courses' },
  },
  {
    path: 'courses/:id',
    name: 'coursesdetails',
    component: () => import(/* webpackChunkName: "courses" */ './views/CourseDetails.vue'),
    meta: { title: 'Courses' },
  },
  {
    path: 'courses/learn/:id',
    name: 'courseslearn',
    component: () => import(/* webpackChunkName: "courses" */ './views/CourseLearn.vue'),
    meta: { title: 'Courses', requiresAuth: true },
  },
  {
    path: 'order-checking',
    name: 'ordercheking',
    component: () => import(/* webpackChunkName: "courses" */ './views/main/OrderChekingPage.vue'),
    meta: { title: 'Order Cheking' },
  },
  {
    path: 'courses/quiz/:lessonId',
    name: 'quiz',
    component: () => import(/* webpackChunkName: "courses" */ './views/QuizPage.vue'),
    meta: { title: 'Courses' },
  },
  {
    path: 'roadmap',
    name: 'roadmap',
    component: () => import(/* webpackChunkName: "roadmap" */ './views/RoadmapPage.vue'),
    meta: { title: 'Roadmap' },
  },
  {
    path: 'signup',
    name: 'signup',
    component: () => import(/* webpackChunkName: "auth" */ './views/auth/SignUpPage.vue'),
    meta: { title: 'Sign Up', guestOnly: true },
  },
  {
    path: 'login',
    name: 'login',
    component: () => import(/* webpackChunkName: "auth" */ './views/auth/LoginPage.vue'),
    meta: { title: 'Login', guestOnly: true },
  },
  {
    path: 'forgot-password',
    name: 'forgot-password',
    component: () => import(/* webpackChunkName: "auth" */ './views/auth/ForgotPassword.vue'),
    meta: { title: 'Forgot Password', guestOnly: true },
  },
  {
    path: 'reset-password',
    name: 'reset-password',
    component: () => import(/* webpackChunkName: "auth" */ './views/ResetPassword.vue'),
    meta: { title: 'Reset Password', guestOnly: true },
  },
]


const teacherRoutes: Array<RouteRecordRaw> = [
  {
    path: 'course-teacher',
    name: 'course-teacher',
    component: () => import(/* webpackChunkName: "teacher" */ './views/Teacher/CourseTeacher.vue'),
    meta: { title: 'My Courses', requiresAuth: true },
  },
  {
    path: 'setting-teacher',
    name: 'setting-teacher',
    component: () => import(/* webpackChunkName: "teacher" */ './views/Teacher/SettingTeacher.vue'),
    meta: { title: 'Settings', requiresAuth: true },
  },
  {
    path: 'course-teacher/create-course',
    name: 'create-course',
    component: () => import(/* webpackChunkName: "teacher" */ './views/Teacher/CreateCourse.vue'),
    meta: { title: 'Create Course', requiresAuth: true },
  },
  {
    path: 'course-teacher/edit-course/:courseId',
    name: 'edit-course',
    component: () => import(/* webpackChunkName: "teacher" */ './views/Teacher/EditCourse.vue'),
    meta: { title: 'Edit Course', requiresAuth: true },
  },
  {
    path: 'course-teacher/courses/:courseId/:chapterId/lessons',
    name: 'create-lesson',
    component: () => import(/* webpackChunkName: "teacher" */ './views/Teacher/CreateLesson.vue'),
    meta: { title: 'Create Lesson', requiresAuth: true },
  },
  {
    path: 'course-teacher/courses/:courseId/:chapterId/:lessonId',
    name: 'edit-lesson',
    component: () => import(/* webpackChunkName: "teacher" */ './views/Teacher/CreateLesson.vue'),
    meta: { title: 'Edit Lesson', requiresAuth: true },
  },
  {
    path: 'course-teacher/courses/:courseId/create-chapter',
    name: 'create-chapter',
    component: () => import(/* webpackChunkName: "teacher" */ './views/Teacher/CreateChapter.vue'),
    meta: { title: 'Create Chapter', requiresAuth: true },
  },
];


const studentRoutes: Array<RouteRecordRaw> = [
  {
    path: 'course-student',
    name: 'course-student',
    component: () =>
      import(/* webpackChunkName: "student" */ './views/ProfileStudent/CourseStudent.vue'),
    meta: { title: 'My Courses', requiresAuth: true },
  },
  {
    path: 'setting-student',
    name: 'setting-student',
    component: () =>
      import(/* webpackChunkName: "student" */ './views/ProfileStudent/SettingStudent.vue'),
    meta: { title: 'Settings', requiresAuth: true },
  },
  {
    path: 'cart',
    name: 'cart',
    component: () => import('./views/ShoppingCart.vue'),
    meta: { title: 'Shopping Cart', requiresAuth: true },
  },
  {
    path: 'payment',
    name: 'payment',
    component: () => import('./views/PaymentPage.vue'),
    meta: { title: 'Payment Page', requiresAuth: true },
  },
]

const adminRoutes: Array<RouteRecordRaw> = [
  {
    path: 'admin',
    name: 'admin',
    component: () => import('./views/admin/AdminPage.vue'),
    meta: {
      title: 'Admin Dashboard',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: 'usersmanager',
    name: 'usersmanager',
    component: () => import(/* webpackChunkName: "admin" */ './views/admin/UserManager.vue'),
    meta: { title: 'User Management', requiresAuth: true, requiresAdmin: true, },
  },
  {
    path: 'teachersmanager',
    name: 'teachersmanager',
    component: () => import(/* webpackChunkName: "admin" */ './views/admin/TeacherManager.vue'),
    meta: { title: 'Teacher Management', requiresAuth: true, requiresAdmin: true, },
  },
  {
    path: 'coursesmanager',
    name: 'coursesmanager',
    component: () => import(/* webpackChunkName: "admin" */ './views/admin/CourseManager.vue'),
    meta: { title: 'Course Management', requiresAuth: true, requiresAdmin: true, },
  },
]

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('./layouts/MainLayout.vue'),
    children: [...publicRoutes, ...studentRoutes, ...teacherRoutes, ...adminRoutes],
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import(/* webpackChunkName: "auth" */ './views/auth/VerifyEmail.vue'),
    meta: { title: 'Verify Email', guestOnly: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import(/* webpackChunkName: "error" */ './views/PageNotFound.vue'),
    meta: { title: 'Page Not Found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  try {
    await authStore.fetchUserProfile()
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  }

  // Set page title
  document.title = to.meta.title ? `${to.meta.title} | QKIT E-Learning` : 'QKIT E-Learning'
  document.title = to.meta.title ? `${to.meta.title} | QKIT E-Learning` : 'QKIT E-Learning'

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  
  if (requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (guestOnly && authStore.isLoggedIn) {
    return next({ name: 'home' })
  }

  if (requiresAdmin && (!authStore.isLoggedIn || !authStore.isAdmin)) {
    // You might want to show a "not authorized" message here
    return next({ name: 'home' })
  }

  next()
})

router.afterEach(() => {
  // Scroll to top after navigation
  window.scrollTo(0, 0)
  
})
export default router
