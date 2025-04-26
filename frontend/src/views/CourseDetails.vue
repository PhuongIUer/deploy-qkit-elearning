<template>
  <div v-if="course">
    <div class="course-background">
      <img :src="course.image" alt="Course Background" />
    </div>
    <div class="course-details-container">
      <!-- Course Header -->
      <div class="course-header">
        <h1>{{ course.name }}</h1>
        <div class="course-tabs">
          <button :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
            Overview
          </button>
          <button :class="{ active: activeTab === 'feedback' }" @click="activeTab = 'feedback'">
            Feedback
          </button>
        </div>
      </div>

      <div class="course-content-wrapper">
        <!-- Left Column - Course Description -->
        <div class="course-description">
          <div v-if="activeTab === 'overview'" class="overview-content">
            <div class="course-intro" v-html="course.description"></div>
          </div>

          <div v-if="activeTab === 'feedback'" class="feedback-tab">
            <div class="rating-overview">
              <div class="average-rating">
                <span class="top-rating">{{ averageRating.average }} out of 5</span>
                <div class="stars-container">
                  <span class="stars">{{ renderStars(averageRating.average) }}</span>
                </div>
                <span class="top-rating-label">Based on {{ averageRating.count }} reviews</span>
              </div>

              <div class="rating-bars">
                <div class="rating-bar" v-for="n in 5" :key="n">
                  <span class="stars-label">{{ 6 - n }} Stars</span>
                  <div class="bar-container">
                    <div class="bar" :style="{ width: `${getStarPercentage(6 - n)}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="reviews-list">
              <div class="review" v-for="review in courseRatings" :key="review.id">
                <div class="reviewer-info">
                  <img
                    :src="review.user.avatar || defaultAvatar"
                    :alt="review.user.userName"
                    class="avatar"
                  />
                  <div class="reviewer-details">
                    <span class="name">{{ review.user.userName }}</span>
                  </div>
                </div>
                <div class="review-stars">
                  <span class="stars">{{ renderStars(review.stars) }}</span>
                </div>
                <div class="review-date">{{ formatReviewDate(review.createdAt) }}</div>
                <p class="review-text">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Course Image & Purchase Card -->
        <div class="course-purchase-card">
          <div class="pricing-info">
            <div class="course-image">
              <img :src="course.image" :alt="course.name" />
            </div>
            <div class="price-container">
              <span class="current-price">{{ formatPrice(course.discountPrice) }}</span>
              <span class="original-price">{{ formatPrice(course.price) }}</span>
              <span class="discount">{{ course.discountPercentage }}% Off</span>
            </div>

            <div class="time-left">
              <span> {{ formatDiscountTime(course.discountTimeRemaining) }} at this price</span>
            </div>

            <div class="action-buttons">
              <button type="button" class="buy-now" @click = "buyNow(course.id)">Buy Now</button>
              <button type="button" class="add-to-cart" @click = "addCart(course.id)">Add to Cart</button>
            </div>

            <div class="course-includes">
              <h4>This Course included</h4>
              <ul>
                <li v-for="feature in course.features" :key="feature.id">
                  <span class="icon">✨</span> {{ feature.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <section class="popular-courses">
      <h2 class="section-title text-navy">Students Are Viewing</h2>
      <CoursesCarousel :courses="popularCourses" />
    </section>
  </div>
  <div v-else class="loading">Loading course details...</div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import CoursesCarousel from '../components/CoursesCarousel.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router';
export default {
  components: {
    CoursesCarousel,
  },
  setup() {
    const router = useRouter();
    const route = useRoute()
    const courseId = route.params.id
    const course = ref(null)
    const activeTab = ref('overview')
    const courseRatings = ref([])
    const ratingStats = ref({ stats: [] })
    const averageRating = ref({ average: 0, count: 0 })
    const popularCourses = ref([])
    const defaultAvatar = 'https://via.placeholder.com/40'
    const api = axios.create({
      baseURL: 'http://localhost:3000/api',
    });
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const addCart = async (courseId) => {
     try {
        await api.post('/cart', { courseId });
        toast.success('Course added to cart successfully!');
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add course to cart. Please try again.');
        throw error;
      }
     }
     const courseIds = ref([])
    const buyNow = async (courseId) => {
      courseIds.value.push(courseId)
      try {
        const response = await api.post('/orders/checkout', { 
          courseIds: courseIds.value
        });
        toast.success('Course added successfully! Waitting for redirecting...');
        if (response.data.url) {
          window.location.href = response.data.url;
        } else {
          throw new Error('No redirect URL received');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add course to cart. Please try again.');
        throw error;
      }
      }
    const fetchCourseRatings = async () => {
      try {
        const [ratingsRes, averageRes, statsRes] = await Promise.all([
          fetch(`http://localhost:3000/api/courses/${courseId}/ratings`),
          fetch(`http://localhost:3000/api/courses/${courseId}/ratings/average`),
          fetch(`http://localhost:3000/api/courses/${courseId}/ratings/stats`),
        ])
        courseRatings.value = ratingsRes.ok ? await ratingsRes.json() : []
        averageRating.value = averageRes.ok ? await averageRes.json() : { average: 0, count: 0 }
        ratingStats.value = statsRes.ok ? await statsRes.json() : { stats: [] }
      } catch (error) {
        console.error('Error fetching ratings:', error)
        courseRatings.value = []
        averageRating.value = { average: 0, count: 0 }
        ratingStats.value = { stats: [] }
      }
    }

    const getStarPercentage = (starCount) => {
      const stat = ratingStats.value.stats?.find((s) => s.stars === starCount)
      return stat ? stat.percentage : 0
    }

    const renderStars = (count) => {
      const fullStars = Math.floor(count)
      const halfStar = count % 1 >= 0.5 ? 1 : 0
      const emptyStars = 5 - fullStars - halfStar

      return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars)
    }

    const formatReviewDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now - date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 1) return 'Today'
      if (diffDays < 30) return `${diffDays} days ago`
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `${months} month${months > 1 ? 's' : ''} ago`
      }
      return date.toLocaleDateString()
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      })
        .format(price)
        .replace('₫', '')
    }

    const transformCourseData = (course) => {
      return {
        id: course.id,
        image: course.image,
        subject: course.category?.name || 'Development',
        level: course.courseLevel?.toLowerCase() || 'beginner',
        title: course.name,
        description: course.description,
        originalPrice: formatPrice(course.price),
        discountedPrice: formatPrice(course.discountPrice || course.price),
        teacherAvatar: course.teachings?.[0]?.avatar || '',
        teacherName: course.teachings?.[0]?.userName || 'Instructor',
        price: course.price,
        students: course.totalStudents || 0,
        rating: course.averageRating || 0,
        reviews: course.ratingCount || 0,
        lectures: course.totalLessons || 0,
        duration: course.totalDuration || '0h 0m',
        isPopular: false,
      }
    }

    const fetchPopularCourses = async () => {
      try {
        const popularResponse = await fetch(
          'http://localhost:3000/api/courses'
        )
        const popularData = await popularResponse.json()
        popularCourses.value = popularData.items.map((course) => transformCourseData(course))
      } catch (error) {
        console.error('Error fetching popular courses:', error)
      }
    }

    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch course data')
        }
        course.value = await response.json()
      } catch (error) {
        console.error('Error fetching course:', error)
      }
    }
    const fetchCourseId = async (courseId) => {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch course data')
        }
        course.value = await response.json()
      } catch (error) {
        console.error('Error fetching course:', error)
      }
    }
    const formatDiscountTime = (dateString) => {
      const endDate = new Date(dateString)
      const now = new Date()

      if (endDate <= now) {
        return 'Discount expired'
      }

      // Tính toán khoảng thời gian còn lại
      const diffTime = endDate - now
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
      const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000)

      // Hiển thị theo các trường hợp
      if (diffDays > 30) {
        const months = Math.floor(diffDays / 30)
        const remainingDays = diffDays % 30
        return `${months} month${months > 1 ? 's' : ''}${
          remainingDays > 0 ? ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''
        } left`
      } else if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''}${
          diffHours > 0 ? ` ${diffHours} hour${diffHours > 1 ? 's' : ''}` : ''
        } left`
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''}${
          diffMinutes > 0 ? ` ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}` : ''
        } left`
      } else {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}${
          diffSeconds > 0 ? ` ${diffSeconds} second${diffSeconds > 1 ? 's' : ''}` : ''
        } left`
      }
    }
    onBeforeRouteUpdate(async (to) => {
      fetchCourseId(to.params.id);
    });
    onMounted(async () => {
      await fetchCourse()
      await fetchPopularCourses()
      await fetchCourseRatings()
    })
    
    return {
      course,
      activeTab,
      courseRatings,
      averageRating,
      ratingStats,
      popularCourses,
      defaultAvatar,
      buyNow,
      addCart,
      formatPrice,
      formatDiscountTime,
      renderStars,
      formatReviewDate,
      getStarPercentage,
    }
  },
}
</script>
  
<style scoped>
.course-background {
  width: 100%;
  height: 250px;
  position: relative;
  margin: 0;
  padding: 0;
  border-radius: 0;
  overflow: hidden;
}

.course-background img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  opacity: 0.3;
}

.course-details-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 20px;
}

.course-header {
  margin-bottom: 30px;
}

.course-header h1 {
  font-size: 40px;
  color: #2f327d;
  margin-bottom: 15px;
  font-weight: 900;
  width: 850px;
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}

.course-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.course-tabs button {
  padding: 10px 20px;
  background: #f0f0f0;
  border: none;
  border-radius: 5px 5px 0 0;
  font-size: 16px;
  cursor: pointer;
  margin-right: 15px;
  color: #666;
}

.course-tabs button.active {
  background: #5c8984;
  color: white;
  font-weight: 600;
}

.course-content-wrapper {
  display: flex;
  gap: 30px;
  position: relative;
}

.course-description {
  flex: 2;
  background-color: #f0f8ff;
  border-radius: 8px;
  padding: 20px;
  margin-right: 50px;
}

.overview-content {
  line-height: 1.6;
}

.course-intro {
  padding-left: 30px ;
  margin-bottom: 15px;
}

.course-purchase-card {
  position: sticky;
  top: 20px;
  width: 320px;
  height: fit-content;
  z-index: 10;
  margin-top: -300px;
}

.course-image img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 15px;
}

.pricing-info {
  background: #f1f8ff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.price-container {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #ff0000;
  margin-right: 10px;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 16px;
  margin-right: 10px;
}

.discount {
  background: #ff0000;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.time-left {
  color: #5c8984;
  font-size: 14px;
  margin-bottom: 15px;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.buy-now,
.add-to-cart {
  padding: 12px 0;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  text-align: center;
}

.buy-now {
  background: #5c8984;
  color: white;
}

.add-to-cart {
  background: white;
  border: 1px solid #5c8984;
  color: #5c8984;
}

.course-includes {
  margin-bottom: 25px;
  border-top: 1px solid #5c8984;
  padding-top: 15px;
}

.course-includes h4 {
  margin-bottom: 15px;
  font-size: 18px;
}

.course-includes ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.course-includes li {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.course-includes .icon {
  margin-right: 10px;
  font-size: 18px;
}

/* Feedback Tab Styles */
.feedback-tab {
  padding-top: 10px;
}

.rating-overview {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.top-rating {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.stars-container {
  margin: 10px 0;
}

.stars {
  color: #ffb800;
  font-size: 18px;
}

.top-rating-label {
  font-size: 14px;
  color: #666;
}

.rating-bars {
  flex: 1;
}

.rating-bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.stars-label {
  width: 60px;
  font-size: 14px;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
}

.bar {
  height: 100%;
  background: #5c8984;
  border-radius: 4px;
}

.reviews-list {
  margin-top: 20px;
}

.review {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  position: relative;
}

.reviewer-info {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.name {
  font-weight: 600;
  color: #333;
}

.review-stars {
  margin-left: 50px;
  margin-bottom: 10px;
}

.review-date {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 14px;
  color: #999;
}

.review-text {
  margin-left: 50px;
  line-height: 1.5;
  color: #666;
}
.popular-courses {
  margin: 0 auto;
  padding: 40px 0;
  background-color: #ebf5ff;
  width: 100%;
}

.popular-courses h2 {
  font-size: 1.8rem;
  color: #374259;
  margin-bottom: 30px;
  text-align: center;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .course-content-wrapper {
    flex-direction: column;
  }

  .course-purchase-card {
    margin-top: 30px;
  }
}

@media (max-width: 768px) {
  .rating-overview {
    flex-direction: column;
    gap: 20px;
  }

  .course-tabs button {
    padding: 8px 15px;
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .course-header h1 {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>