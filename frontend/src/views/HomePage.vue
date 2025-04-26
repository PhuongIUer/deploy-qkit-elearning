<template>
  <div>
    <div class="home-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>
              <span class="text-teal-hero">Studying Online </span>
              <span class="text-navy">is now</span><br />
              <span class="text-navy">much easier</span>
            </h1>
            <p class="hero-description">
              QEL is an interesting platform that will teach you in more an interactive way
            </p>
            <button class="btn-register">Register Now !</button>
          </div>
          <div class="hero-image">
            <img :src="HeroImg" alt="Student with notebooks" />

            <!-- Floating Elements -->

            <!-- Stats number of students card -->
            <div class="float-card stats-card">
              <div class="icon-container">
                <img :src="HeroStudent" alt="Student" />
              </div>
              <div class="stats-content">
                <p class="stats-number">250k</p>
                <p class="stats-text">Assisted Student</p>
              </div>
            </div>

            <!-- Chart card -->
            <div class="float-card chart-card">
              <img :src="HeroChart" alt="Chart" />
            </div>

            <!-- Course card -->
            <div class="float-card course-card">
              <div class="course-header">
                <div class="course-avatar">
                  <img :src="AboutStudent" alt="Course Image" />
                </div>
                <div class="course-info">
                  <p class="course-title">Learning Javascript Zero to Hero</p>
                  <p class="course-date">is free to 15/3/2025</p>
                </div>
              </div>
              <button class="btn-join">Join Now</button>
            </div>

            <!-- Success card-->
            <div class="float-card success-card">
              <div class="success-icon">
                <img :src="HeroMess" alt="Message" />
              </div>
              <div class="success-content">
                <p class="success-title">Congratulations</p>
                <p class="success-text">Your admission completed</p>
              </div>
              <div class="success-check">
                <span class="checkmark">✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <h2 class="stats-tilte">Our Success</h2>
        <p class="stats-description">
          With the mission of providing a quality online learning experience, we constantly expand
          and enhance the system, helping thousands of students access knowledge easily. A team of
          experienced lecturers and a rich collection of lectures have created an effective learning
          environment where students can practice skills, take standardized tests and receive
          dedicated support. After many years of development, our platform has become a reliable
          choice for those who want to improve their skills and develop themselves.
        </p>
        <div class="stats-container">
          <div class="stat-item">
            <h3 class="stat-number">15K+</h3>
            <p class="stat-label">Students</p>
          </div>
          <div class="stat-item">
            <h3 class="stat-number">500+</h3>
            <p class="stat-label">Standardized quizzes</p>
          </div>
          <div class="stat-item">
            <h3 class="stat-number">30+</h3>
            <p class="stat-label">High-quality instructors</p>
          </div>
          <div class="stat-item">
            <h3 class="stat-number">5</h3>
            <p class="stat-label">Years of experience</p>
          </div>
        </div>
      </section>

      <!-- What is QEL Section -->
      <section class="about-section">
        <h2 class="about-title">What is <span class="text-teal-QEL">QEL</span>?</h2>
        <p class="about-description">
          QEL is an online learning platform that enables instructors to register and create
          courses, upload and manage course materials, assignments, quizzes, and exams. Learners can
          enroll in courses, access lectures, complete assignments, and submit course evaluations.
          The platform supports course payments, discount codes, and integrates AI to recommend
          courses based on learning behavior and preferences. Additionally, AI moderates comments to
          maintain a positive learning environment. A built-in chatbox feature assists users with
          inquiries and support.
        </p>
        <div class="actions-container">
          <div class="action-box">
            <img :src="AboutTeacher" alt="For teacher" />
            <div class="action-overlay">
              <h3>FOR INSTRUCTORS</h3>
              <button class="btn-action-apply-cv" @click="openContactForm">Apply CV now</button>
            </div>
          </div>
          <div class="action-box">
            <img :src="AboutStudent" alt="For students" />
            <div class="action-overlay">
              <h3>FOR STUDENTS</h3>
              <button class="btn-action" @click="$router.push('/courses')">
                Register course now
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <h2 class="section-title">Our <span class="text-teal">Features</span></h2>
        <p class="section-description">
          This very extraordinary feature, can make learning activities more efficient
        </p>

        <transition name="fade">
          <div class="feature-grid" v-if="!isFeaturesCollapsed">
            <!-- Assignment & Quiz Management -->
            <div class="feature-card">
              <div class="feature-content">
                <h3 class="feature-title">
                  Assignment & Quiz <span class="text-teal">Management:</span>
                </h3>
                <p class="feature-description">
                  Instructors can design and publish assignments, quizzes, and exams with flexible
                  configurations such as time limits, question types (multiple-choice, essay,
                  true/false), and automatic grading where applicable. Manual grading options allow
                  instructors to provide detailed feedback.
                </p>
              </div>
              <div class="feature-image">
                <img :src="FeatureManagement" alt="Feature Management" />
              </div>
            </div>

            <!-- Assessments -->
            <div class="feature-card reverse">
              <div class="feature-content">
                <h3 class="feature-title">
                  Assessments, <span class="text-teal">Quizzes,</span> Tests:
                </h3>
                <p class="feature-description">
                  Easily launch live assignments, quizzes, and tests. Student results are
                  automatically entered in the online gradebook.
                </p>
              </div>
              <div class="feature-image">
                <img :src="FeatureQuizz" alt="Feature Quizz" />
              </div>
            </div>

            <!-- Payment & Discount System -->
            <div class="feature-card">
              <div class="feature-content">
                <h3 class="feature-title">
                  Payment & <span class="text-teal">Discount System:</span>
                </h3>
                <p class="feature-description">
                  The platform supports secure online payment methods, allowing students to purchase
                  courses seamlessly. Discount codes and promotional offers can be applied at
                  checkout to encourage enrollments.
                </p>
              </div>
              <div class="feature-image">
                <img :src="FeaturePayment" alt="Feature Payment" />
              </div>
            </div>

            <!-- Chatbox Support -->
            <div class="feature-card reverse">
              <div class="feature-content">
                <h3 class="feature-title"><span class="text-teal">Chatbox</span> Support:</h3>
                <p class="feature-description">
                  An integrated chatbox provides instant assistance to users, answering common
                  questions related to course access, technical issues, and platform navigation.
                  This feature enhances user experience by offering real-time support.
                </p>
              </div>
              <div class="feature-image">
                <img :src="FeatureChatbox" alt="Feature Chatbox" />
              </div>
            </div>

            <!-- Comment Moderation -->
            <div class="feature-card">
              <div class="feature-content">
                <h3 class="feature-title"><span class="text-teal">Comment</span> Moderation:</h3>
                <p class="feature-description">
                  AI automatically reviews and filters student comments in discussion forums and
                  course reviews, detecting inappropriate content, spam, or harmful language to
                  maintain a positive and professional learning environment.
                </p>
              </div>
              <div class="feature-image"><img :src="FeatureAI" alt="Feature AI" /></div>
            </div>
          </div>
        </transition>
        <div class="center-button">
          <button class="btn-collapse" @click="toggleFeatures">
            {{ isFeaturesCollapsed ? 'Explore More' : 'Collapse Features' }}
          </button>
        </div>
      </section>

      <!-- Course Section -->
      <section class="courses-section">
        <h2 class="section-title text-navy">Explore Course</h2>
        <p class="section-description">
          Discover a wide range of courses tailored to different skill levels and interests. Browse
          through various categories, read course descriptions, check ratings and reviews, and
          enroll in the right course to advance your learning journey.
        </p>

        <div class="courses-container">
          <CoursesCarousel :courses="popularCourses" />
        </div>
      </section>
    </div>
    <ApplyCV :show="showContactForm" @close-dialog="closeContactForm" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import Navbar from '../components/shared/Navbar.vue'
import FooterVue from '../components/shared/Footer.vue'
import HeroImg from '../assets/hero-img.png'
import HeroMess from '../assets/hero-message.png'
import HeroChart from '../assets/hero-chart.png'
import HeroStudent from '../assets/hero-student.png'
import AboutTeacher from '../assets/about-teacher.png'
import AboutStudent from '../assets/about-students.png'
import FeatureManagement from '../assets/feature-management.png'
import FeatureQuizz from '../assets/feature-quizz.png'
import FeaturePayment from '../assets/feature-payment.png'
import FeatureChatbox from '../assets/feature-chatbox.png'
import FeatureAI from '../assets/feature-ai.png'
import Course from '../components/Course.vue'
import ApplyCV from '../components/ApplyCV.vue'
import CourseImg from '../assets/course-img.png'
import CourseTeacher from '../assets/course-author.png'
import Carousel from '../components/Carousel.vue'
import { useAuthStore } from '../store/auth.ts'
import { errorMessages } from 'vue/compiler-sfc'
import { toast } from 'vue3-toastify'
import CoursesCarousel from '../components/CoursesCarousel.vue'
import type { ICourse } from '../types/courses'
import courseService from '../api/CourseService'

export default defineComponent({
  components: {
    Navbar,
    FooterVue,
    Course,
    ApplyCV,
    Carousel,
    CoursesCarousel,
  },
  emits: ['close-dialog'],
  setup(props, { emit }) {
    const showContactForm = ref(false)
    const authStore = useAuthStore()
    const openContactForm = () => {
      authStore.fetchUserProfile()
      if (!authStore.isLoggedIn) {
        toast.warning('Please login to apply applications')
      } else if (authStore.isTeacher) {
        toast.warning('Teacher cannot apply CV')
      } else {
        showContactForm.value = true
      }
      emit('close-dialog')
    }

    const closeContactForm = () => {
      showContactForm.value = false
    }

    const isFeaturesCollapsed = ref(false)

    const toggleFeatures = () => {
      isFeaturesCollapsed.value = !isFeaturesCollapsed.value
    }
    const popularCourses = ref<ICourse[]>([])
    const fetchPopularCourses = async () => {
      // try {
      //   const popularResponse = await fetch(
      //     'http://14.225.217.42:5000/api/courses?sortBy=totalStudents&order=desc'
      //   )
      //   const popularData = await popularResponse.json()
      //   popularCourses.value = popularData.items.map((course) => transformCourseData(course))
      // } catch (error) {
      //   console.error('Error fetching popular courses:', error)
      // }

      const popularResponse = await fetch('http://14.225.217.42:5000/api/courses')
      const popularData = await popularResponse.json()
      popularCourses.value = popularData.items
      // For demo, just take first few as popular courses
      // popularCourses.value = popularCourses.value.items
      //   .slice(0, 5)
      //   .map((course) => transformCourseData(course))

      courseService.getPopularCourse().then((res) => {
        popularCourses.value = res.items.slice(0, 5).map((course) => {
          return {
            ...course,
          }
        })
      })
    }

    const courses = ref([
      {
        image: CourseImg,
        subject: 'Development',
        originalPrice: '$29.00',
        discountedPrice: '$9.00',
        title: 'Learning JavaScript With Imagination',
        teacherAvatar: CourseTeacher,
        teacherName: 'David Millar',
        rating: 4.8,
        reviews: 500,
        lectures: 5,
        duration: '11h 20m',
        students: 22,
      },
      {
        image: CourseImg,
        subject: 'Development',
        originalPrice: '$29.00',
        discountedPrice: '$9.00',
        title: 'Learning JavaScript With Imagination',
        teacherAvatar: CourseTeacher,
        teacherName: 'David Millar',
        rating: 4.8,
        reviews: 500,
        lectures: 5,
        duration: '11h 20m',
        students: 22,
      },
      {
        image: CourseImg,
        subject: 'Development',
        originalPrice: '$29.00',
        discountedPrice: '$9.00',
        title: 'Learning JavaScript With Imagination',
        teacherAvatar: CourseTeacher,
        teacherName: 'David Millar',
        rating: 4.8,
        reviews: 500,
        lectures: 5,
        duration: '11h 20m',
        students: 22,
      },
      {
        image: CourseImg,
        subject: 'Development',
        originalPrice: '$29.00',
        discountedPrice: '$9.00',
        title: 'Learning JavaScript With Imagination',
        teacherAvatar: CourseTeacher,
        teacherName: 'David Millar',
        rating: 4.8,
        reviews: 500,
        lectures: 5,
        duration: '11h 20m',
        students: 22,
      },
      {
        image: CourseImg,
        subject: 'Development',
        originalPrice: '$29.00',
        discountedPrice: '$9.00',
        title: 'Learning JavaScript With Imagination',
        teacherAvatar: CourseTeacher,
        teacherName: 'David Millar',
        rating: 4.8,
        reviews: 500,
        lectures: 5,
        duration: '11h 20m',
        students: 22,
      },
    ])
    onMounted(() => {
      fetchPopularCourses()
    })

    return {
      HeroImg,
      HeroMess,
      HeroChart,
      HeroStudent,
      AboutTeacher,
      AboutStudent,
      FeatureManagement,
      FeatureQuizz,
      FeaturePayment,
      FeatureChatbox,
      FeatureAI,
      showContactForm,
      openContactForm,
      closeContactForm,
      courses,
      isFeaturesCollapsed,
      toggleFeatures,
      popularCourses,
    }
  },
})
</script>

<style scoped>
.home-content {
  text-align: center;
  color: #333;
  max-width: 1900px;
  margin: 0px auto;
  padding: 0px auto;
}

/* Hero Section */
.hero-section {
  background-color: #ffeded;
  border-radius: 0px 0px 150px 150px;
  padding: 0px 100px;
  overflow: hidden;
  position: relative;
  margin: 0px auto;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.hero-text {
  flex: 1;
  text-align: left;
  max-width: 600x;
  margin-top: 20px;
}

.hero-text h1 {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 30px;
}

.text-teal-hero {
  color: #5c8984;
}

.text-teal-QEL {
  color: #cc8989;
}

.text-navy {
  color: #1a2749;
}

.hero-description {
  font-size: 20px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.btn-register {
  font-family: 'Baloo 2', sans-serif;
  background-color: #5c8984;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease, transform 0.2s ease;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-register:hover {
  background-color: #69b0b0;
  transform: scale(1.05);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
}

.hero-image {
  position: relative;
  max-width: 35%;
}
.hero-image img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Floating Cards */
.float-card {
  position: absolute;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 15px;
  z-index: 2;
}

/* Stats Card */
.stats-card {
  display: flex;
  top: 10%;
  left: -100px;
  padding: 15px 25px;
  align-items: center;
  gap: 10px;
}

.icon-container {
  background-color: #e8f4f8;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container img {
  width: 24px;
  height: 24px;
}

.stats-content {
  display: flex;
  flex-direction: column;
}

.stats-number {
  font-weight: bold;
  font-size: 18px;
  margin: 0;
}

.stats-text {
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* Chart Card */
.chart-card {
  top: 20%;
  right: 20px;
  background-color: #f8e8e8;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
}

.chart-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Course Card */
.course-card {
  bottom: 25%;
  left: -200px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  min-width: 280px;
  flex-direction: column;
}

.course-avatar {
  background-color: #333;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.course-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.course-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;
}

.course-info {
  flex: 1;
}

.course-title {
  font-weight: bold;
  font-size: 14px;
  margin: 0 0 2px 0;
}

.course-date {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.btn-join {
  background-color: #d8587e;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 25px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 700;
}

/* Success Card */
.success-card {
  bottom: 10%;
  right: -40px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
}

.success-icon {
  background-color: #ffeaea;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon img {
  width: 24px;
  height: 24px;
}

.success-content {
  flex: 1;
}

.success-title {
  font-weight: bold;
  font-size: 14px;
  margin: 0 0 2px 0;
}

.success-text {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.success-check {
  background-color: #e6ffe6;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-weight: bold;
}

/* Stat Section */

.stats-section {
  text-align: center;
  padding: 20px 20px;
  max-width: 1400px;
  margin: 20px auto;
}

.stats-tilte {
  color: #2f327d;
  font-size: 45px;
  margin-bottom: 10px;
  font-weight: 900;
}

.stats-description {
  color: #666;
  max-width: 1300px;
  margin: 0 auto 100px;
  line-height: 1.6;
  font-size: 20px;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.stat-item {
  text-align: center;
  margin: -50px auto 30px;
}

.stat-number {
  font-size: 60px;
  margin-bottom: 10px;
  font-weight: bold;
  background: linear-gradient(to right, #136cb5, #49bbbd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  color: #010514;
  font-size: 25px;
  text-transform: capitalize;
}

/* What is QEL? */
.about-section {
  /* width: 100%; */
  padding: 20px;
  text-align: center;
  background-color: #ebf5ff;
  padding-bottom: 70px;
}

.about-title {
  font-size: 45px;
  color: #5c8984;
  margin-bottom: 10px;
  margin-top: 20px;
}

.about-title .text-teal {
  color: #cc8989;
}

.about-description {
  max-width: 1300px;
  margin: 0 auto 40px;
  color: #666;
  line-height: 1.6;
  font-size: 20px;
}

.actions-container {
  display: flex;
  justify-content: center;
  gap: 200px;
}

.action-box {
  position: relative;
  width: 400px;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.action-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  color: white;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.action-overlay h3 {
  margin-bottom: 20px;
  font-size: 30px;
}

.btn-action,
.btn-action-apply-cv {
  background-color: #f2d8d8;
  color: #5c8984;
  border: none;
  padding: 15px 35px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
  transition: background-color 0.3s ease;
  font-family: 'Baloo 2', sans-serif;
}

.btn-action:hover {
  background-color: #f9ccd3;
  transform: scale(1.05);
}

.btn-action-apply-cv:hover {
  background-color: #f9ccd3;
  transform: scale(1.05);
}

/* Features Section */
.features-section {
  max-width: 1100px;
  margin: 50px auto;
}

.section-title {
  text-align: center;
  margin-bottom: 10px;
  font-size: 45px;
  font-weight: bold;
  color: #2f327d;
}

.section-description {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 20px;
  max-width: 1300px;
  margin: 0 auto 30px auto;
}

.text-teal {
  color: #00cbb8;
}

.feature-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.feature-card {
  display: flex;
  align-items: center;
  overflow: hidden;
  justify-content: center;
  text-align: center;
  gap: 70px;
}

.feature-card.reverse {
  flex-direction: row-reverse;
}

.feature-content {
  flex: 1;
  padding: 40px;
  text-align: left;
}

.feature-title {
  font-size: 35px;
  margin-bottom: 15px;
  color: #2f327d;
}

.feature-description {
  color: #666;
  line-height: 1.6;
  font-size: 20px;
}

.feature-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.feature-image img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.center-button {
  text-align: center;
  margin-top: 30px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform-origin: top;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.feature-grid {
  transition: all 0.3s ease;
}

.center-button {
  margin-top: 30px;
  margin-bottom: 40px;
  text-align: center;
}

.btn-collapse {
  font-family: 'Baloo 2', sans-serif;
  background-color: #5c8984;
  color: #f2d8d8;
  font-weight: bold;
  font-size: 17px;
  border: none;
  padding: 12px 28px;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 40px;
  cursor: pointer;
}

.btn-collapse:hover {
  background-color: #43aa97;
}

/* Explore Course */
.courses-section {
  margin: 0 auto;
  padding: 40px 0;
  background-color: #ebf5ff;
  width: 100%;
}

.courses-container {
  position: relative;
  max-width: 1300px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  max-width: 1300px;
  margin: 0 auto 30px;
}

/* Thêm style cho navigation arrows nếu muốn */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;
}

.carousel-nav button {
  pointer-events: all;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
.see-all {
  color: #3a86ff;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
  white-space: nowrap;
  margin-left: 20px;
}

.see-all:hover {
  color: #2667cc;
  text-decoration: underline;
}

.courses-container {
  max-width: 1300px;
  margin: 0 auto;
}
.navbar {
  text-align: center;
}

.footer {
  text-align: center;
  position: relative;
  bottom: 0;
  width: 100%;
}
</style>
