<template>
  <div class="courses-carousel-wrapper">
    <!-- Thêm wrapper div để kiểm soát khung hiển thị -->
    <div class="carousel-viewport">
      <div ref="sliderRef" class="keen-slider">
        <div v-for="(course, index) in processedCourses" :key="index" class="keen-slider__slide">
          <div class="course-slide-container">
            <CourseCard :course="course" />
          </div>
        </div>
      </div>
    </div>
    <!-- Navigation arrows -->
    <button class="carousel-arrow prev" @click="prevGroup">‹</button>
    <button class="carousel-arrow next" @click="nextGroup">›</button>
  </div>
</template>
  
<script>
import { ref, onMounted, computed } from 'vue'
import KeenSlider from 'keen-slider'
import 'keen-slider/keen-slider.min.css'
import CourseCard from './CourseCard.vue'
import CourseImg from '../assets/course-img.png'
import CourseTeacher from '../assets/course-author.png'

export default {
  components: {
    CourseCard,
  },
  props: {
    courses: {
      type: Array,
      default: () => [],
    },
    fetchFromApi: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const sliderRef = ref(null)
    const slider = ref(null)
    const apiCourses = ref([])

    // Track current page and items per page
    const currentSlideIndex = ref(0)
    const itemsPerView = ref(4) // Default for desktop

    const transformCourseData = (course) => {
      return {
        id: course.id || course._id || course.courseId,
        image: course.image || CourseImg,
        subject: course.category?.name || course.subject || 'Development',
        originalPrice: course.originalPrice || `$${course.price || 0}`,
        discountedPrice: course.discountedPrice || `$${course.discountPrice || course.price || 0}`,
        title: course.title || course.name || 'No title',
        teacherAvatar: course.teacherAvatar || course.teachings?.[0]?.userAvatar || CourseTeacher,
        teacherName: course.teacherName || course.teachings?.[0]?.userName || 'Instructor',
        rating: course.rating || course.averageRating || 0,
        reviews: course.reviews || course.ratingCount || 0,
        lectures: course.lectures || course.totalLessons || 0,
        duration: course.duration || course.totalDuration || '0h 0m',
        students: course.students || course.totalStudents || 0,
      }
    }

    // Process courses to ensure they have the correct format
    const processedCourses = computed(() => {
      if (props.fetchFromApi) {
        return apiCourses.value.map((course) => transformCourseData(course))
      } else {
        return props.courses.map((course) => transformCourseData(course))
      }
    })

    // Navigation functions
    const nextGroup = () => {
      if (!slider.value) return

      // Calculate total slides and move forward by the number of items per view
      const totalSlides = processedCourses.value.length
      const slidesPerView = getItemsPerView()

      // Calculate the next slide index with loop functionality
      const nextIndex = (currentSlideIndex.value + slidesPerView) % totalSlides

      slider.value.moveToIdx(nextIndex)
      currentSlideIndex.value = nextIndex
    }

    const prevGroup = () => {
      if (!slider.value) return

      // Calculate total slides and move backward by the number of items per view
      const totalSlides = processedCourses.value.length
      const slidesPerView = getItemsPerView()

      // Calculate the previous slide index with loop functionality
      let prevIndex = currentSlideIndex.value - slidesPerView
      if (prevIndex < 0) {
        // If going back from the beginning, jump to an appropriate position
        prevIndex = Math.floor((totalSlides - 1) / slidesPerView) * slidesPerView
      }

      slider.value.moveToIdx(prevIndex)
      currentSlideIndex.value = prevIndex
    }

    // Helper to get current items per view based on screen size
    const getItemsPerView = () => {
      if (window.innerWidth <= 600) return 1
      if (window.innerWidth <= 900) return 2
      if (window.innerWidth <= 1200) return 3
      return 4
    }

    // Update items per view on resize
    const handleResize = () => {
      itemsPerView.value = getItemsPerView()
    }

    // Fetch courses từ API (chỉ khi cần)
    const fetchCourses = async () => {
      if (!props.fetchFromApi) return

      try {
        const response = await fetch(
          'http://14.225.217.42:5000/api/courses?limit=20&sortBy=totalStudents&order=desc'
        )
        const data = await response.json()
        apiCourses.value = data.items || []
      } catch (error) {
        console.error('Error fetching courses:', error)
        apiCourses.value = []
      }
    }

    onMounted(() => {
      // Fetch data only if needed
      if (props.fetchFromApi) {
        fetchCourses()
      }

      // Add window resize listener
      window.addEventListener('resize', handleResize)

      // Initialize items per view
      itemsPerView.value = getItemsPerView()

      // Initialize slider with the correct options
      setTimeout(() => {
        if (sliderRef.value) {
          slider.value = new KeenSlider(sliderRef.value, {
            slides: {
              perView: itemsPerView.value,
              spacing: 10,
            },
            breakpoints: {
              '(max-width: 1200px)': { slides: { perView: 3 } },
              '(max-width: 900px)': { slides: { perView: 2 } },
              '(max-width: 600px)': { slides: { perView: 1 } },
            },
            loop: false, // Disable automatic looping
            dragSpeed: 0.5,
            rubberband: false, // Prevent elastic overscroll
          })
        }
      }, 100)
    })

    return {
      sliderRef,
      slider,
      processedCourses,
      nextGroup,
      prevGroup,
    }
  },
}
</script>

<style scoped>
/* Thêm vào style của CoursesCarousel.vue */
.courses-carousel-wrapper {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px; /* Tạo khoảng đệm hai bên */
}

.carousel-viewport {
  overflow: hidden; /* Ẩn phần tràn ra ngoài */
  width: 100%;
}

.keen-slider {
  display: flex;
  user-select: none;
  -webkit-touch-callout: none;
  -khtml-user-select: none;
  touch-action: pan-y;
}

.course-slide-container {
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
}

/* Navigation arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-arrow.prev {
  left: 0;
}

.carousel-arrow.next {
  right: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .courses-carousel-wrapper {
    padding: 0 30px;
  }

  .carousel-arrow {
    width: 30px;
    height: 30px;
  }
}
</style>