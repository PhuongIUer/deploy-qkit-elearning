<!-- QuizPage.vue -->
<template>
  <div class="quiz-container">
    <!-- Quiz Header with Timer -->
    <div class="quiz-header">
      <h1>{{ quiz.title }}</h1>
      <div class="quiz-timer" :class="{ warning: timeRemaining < 60 }">
        <i class="fas fa-clock"></i> {{ formatTime(timeRemaining) }} remaining
      </div>
    </div>

    <!-- Quiz Progress -->
    <div class="quiz-progress">
      <div class="progress-bar">
        <div
          class="progress-filled"
          :style="{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }"
        ></div>
      </div>
      <div class="progress-text">
        Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading quiz...
    </div>

    <!-- Quiz Content -->
    <div v-else-if="!quizCompleted && currentQuestion" class="quiz-content">
      <div class="question-container">
        <h2>{{ currentQuestion.question }}</h2>

        <div class="answers-container">
          <div
            v-for="(option, index) in currentQuestion.options"
            :key="option.id"
            class="answer-option"
            :class="{
              selected: selectedAnswer === option.id,
              correct: showFeedback && option.isCorrect,
              incorrect: showFeedback && selectedAnswer === option.id && !option.isCorrect,
            }"
            @click="selectAnswer(option.id)"
          >
            <div class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}</div>
            <div class="option-text">{{ option.text }}</div>
            <div v-if="showFeedback && option.isCorrect" class="feedback-icon correct">
              <i class="fas fa-check"></i>
            </div>
            <div
              v-else-if="showFeedback && selectedAnswer === option.id && !option.isCorrect"
              class="feedback-icon incorrect"
            >
              <i class="fas fa-times"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="feedback-container" v-if="showFeedback">
        <div class="feedback-message" :class="isCorrect ? 'correct' : 'incorrect'">
          <h3>{{ isCorrect ? 'Correct!' : 'Incorrect' }}</h3>
          <p>{{ currentQuestion.options.find((opt) => opt.isCorrect).explanation }}</p>
        </div>
        <button class="next-button" @click="nextQuestion">
          {{ currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question' }}
        </button>
      </div>
    </div>

    <!-- Quiz Results -->
    <div v-else-if="quizCompleted" class="quiz-results">
      <div class="results-header">
        <h2>Quiz Completed!</h2>
        <div class="score-container">
          <div class="score">
            <span class="score-value">{{ score }}</span>
            <span class="score-total">/{{ quiz.questions.length }}</span>
          </div>
        </div>
        <div :class="['pass-fail', isPassed ? 'pass' : 'failed']">
          {{ isPassed ? 'PASSED' : 'FAILED' }}
        </div>
      </div>

      <div class="results-review">
        <h3>Question Review</h3>
        <div v-for="(question, index) in quiz.questions" :key="question.id" class="review-item">
          <div class="review-question">
            <div class="question-number">{{ index + 1 }}</div>
            <div class="question-text">
              <h4>{{ question.question }}</h4>
              <div
                class="user-answer"
                :class="{ correct: isAnswerCorrect(question.id, userAnswers[question.id]) }"
              >
                Your answer: {{ getAnswerText(question.id) || 'Not answered' }}
                <i
                  v-if="isAnswerCorrect(question.id, userAnswers[question.id])"
                  class="fas fa-check"
                ></i>
                <i v-else class="fas fa-times"></i>
              </div>
              <div class="correct-answer">
                Correct answer: {{ getCorrectAnswerText(question.id) }}
              </div>
              <div class="explanation">
                <strong>Explanation:</strong>
                {{ getCorrectAnswerExplanation(question.id) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="retry-button" @click="retryQuiz">Retry Quiz</button>
        <div v-if="!loading && !quiz.title" class="error-state">
          <h2>Error Loading Quiz</h2>
          <p>
            We couldn't load the quiz. The lesson ID may be invalid or there might be a server
            issue.
          </p>
          <button @click="goBackToLesson" class="back-button">Back to Lessons</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const lessonId = route.params.lessonId

// Quiz state
const loading = ref(true)
const quiz = ref({
  title: '',
  questions: [],
  passingScore: 70,
  timeLimit: 20, // in minutes
})
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showFeedback = ref(false)
const quizCompleted = ref(false)
const userAnswers = ref({})
const score = ref(0)
const isPassed = ref(false)
const startTime = ref(null)

// Timer state
const timeRemaining = ref(0)
let timerInterval = null

// Computed properties
const currentQuestion = computed(() => quiz.value.questions[currentQuestionIndex.value] || null)
const isCorrect = computed(() => {
  if (!currentQuestion.value || selectedAnswer.value === null) return false
  const selectedOption = currentQuestion.value.options.find(
    (opt) => opt.id === selectedAnswer.value
  )
  return selectedOption ? selectedOption.isCorrect : false
})

// Methods
const fetchQuizData = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('authToken')

    // Add check for missing token
    if (!token) {
      toast.error('Please login to access the quiz')
      router.push('/login')
      return
    }

    console.log('Using lessonId:', lessonId)
    console.log('Token exists:', !!token)

    const response = await fetch(`http://localhost:3000/api/quizzes/lesson/${lessonId}/student`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('API response status:', response.status)

    if (!response.ok) {
      // Handle 401 specifically
      if (response.status === 401) {
        toast.error('Session expired. Please login again.')
        router.push('/login')
        return
      }

      const errorText = await response.text()
      console.error('API error response:', errorText)
      throw new Error(`Failed to fetch quiz data: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Quiz data received:', data)

    // Ensure we have the quiz data
    if (!data || !data.id) {
      throw new Error('Invalid quiz data received from server')
    }

    quiz.value = data
    timeRemaining.value = quiz.value.timeLimit * 60

    // Format start time in YYYY-MM-DD HH:MM:SS format to match API expectations
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    startTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    console.log('Formatted start time:', startTime.value)

    loading.value = false
  } catch (error) {
    console.error('Error fetching quiz data:', error)
    toast.error(`Failed to load quiz data: ${error.message}`)
    loading.value = false
  }
}

const selectAnswer = (optionId) => {
  if (showFeedback.value) return // Prevent selecting after feedback is shown

  selectedAnswer.value = optionId
  showFeedback.value = true

  // Record user's answer
  userAnswers.value[currentQuestion.value.id] = [optionId.toString()]

  // Update score
  const selectedOption = currentQuestion.value.options.find((opt) => opt.id === optionId)
  if (selectedOption && selectedOption.isCorrect) {
    score.value++
  }
}

const nextQuestion = () => {
  showFeedback.value = false
  selectedAnswer.value = null

  if (currentQuestionIndex.value < quiz.value.questions.length - 1) {
    currentQuestionIndex.value++
  } else {
    completeQuiz()
  }
}

const completeQuiz = async () => {
  try {
    const token = localStorage.getItem('authToken')
    const percentage = Math.round((score.value / quiz.value.questions.length) * 100)
    isPassed.value = percentage >= quiz.value.passingScore

    // Validate quiz data before submission
    if (!quiz.value.id) {
      console.error('Quiz ID missing in quiz data:', quiz.value)
      throw new Error('Quiz data is incomplete. Please try again.')
    }

    // Format the startTime as expected by the API (YYYY-MM-DD HH:MM:SS)
    const startTimeDate = new Date(startTime.value)
    // If startTime is already a formatted string, use it directly
    const formattedStartTime =
      typeof startTime.value === 'string'
        ? startTime.value
        : `${startTimeDate.getFullYear()}-${String(startTimeDate.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(startTimeDate.getDate()).padStart(2, '0')} ${String(
            startTimeDate.getHours()
          ).padStart(2, '0')}:${String(startTimeDate.getMinutes()).padStart(2, '0')}:${String(
            startTimeDate.getSeconds()
          ).padStart(2, '0')}`

    // Create a properly formatted answers object
    // Convert from Proxy object to plain object with the right format
    const formattedAnswers = {}
    Object.keys(userAnswers.value).forEach((questionId) => {
      // Ensure each answer is an array of strings
      formattedAnswers[questionId] = Array.isArray(userAnswers.value[questionId])
        ? userAnswers.value[questionId]
        : [userAnswers.value[questionId].toString()]
    })

    // Prepare submission data
    const submissionData = {
      answers: formattedAnswers,
      startTime: formattedStartTime,
    }

    console.log('Submitting quiz attempt with data:', submissionData)

    const response = await fetch(`http://localhost:3000/api/quizzes/${quiz.value.id}/attempt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(submissionData),
    })

    if (!response.ok) {
      // Try to get the error message from the response
      let errorText = 'Unknown error'
      try {
        const errorData = await response.json()
        errorText = errorData.message || response.statusText
      } catch {
        errorText = (await response.text()) || `Failed to submit quiz: ${response.status}`
      }

      // Special handling for time limit exceeded error
      if (errorText.includes('time limit exceeded')) {
        toast.warning('Time limit exceeded. Please try again with a new attempt.')
        // Reset quiz immediately to allow a new attempt
        retryQuiz()
        return
      }

      throw new Error(errorText)
    }

    const result = await response.json()
    console.log('Quiz results saved:', result)
    quizCompleted.value = true
    clearInterval(timerInterval)

    if (isPassed.value) {
      toast.success('Congratulations! You passed the quiz!')
    } else {
      toast.warning(`You scored ${percentage}%. Try again to pass!`)
    }
  } catch (error) {
    console.error('Error submitting quiz:', error)
    toast.error(error.message || 'Failed to submit quiz results')

    // Optionally allow retry if it's not an auth error
    if (!error.message.includes('Unauthorized')) {
      quizCompleted.value = false
    }
  }
}

const timeUp = () => {
  if (!quizCompleted.value) {
    toast.warning("Time's up! Your quiz has been submitted automatically.")
    completeQuiz()
  }
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      completeQuiz()
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const retryQuiz = () => {
  // Reset quiz state
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showFeedback.value = false
  quizCompleted.value = false
  userAnswers.value = {}
  score.value = 0
  timeRemaining.value = quiz.value.timeLimit * 60
  startTime.value = new Date().toISOString()

  // Restart timer
  startTimer()
}

const goBackToLesson = () => {
  router.push(`/courses/learn/${lessonId}`)
}
// Helper methods for results review
const getAnswerText = (questionId) => {
  const question = quiz.value.questions.find((q) => q.id === questionId)
  if (!question || !userAnswers.value[questionId]) return null
  const answerId = userAnswers.value[questionId][0]
  const option = question.options.find((opt) => opt.id.toString() === answerId)
  return option ? option.text : null
}

const getCorrectAnswerText = (questionId) => {
  const question = quiz.value.questions.find((q) => q.id === questionId)
  if (!question) return ''
  const correctOption = question.options.find((opt) => opt.isCorrect)
  return correctOption ? correctOption.text : ''
}

const getCorrectAnswerExplanation = (questionId) => {
  const question = quiz.value.questions.find((q) => q.id === questionId)
  if (!question) return ''
  const correctOption = question.options.find((opt) => opt.isCorrect)
  return correctOption ? correctOption.explanation : ''
}

const isAnswerCorrect = (questionId, answerIds) => {
  if (!answerIds || answerIds.length === 0) return false
  const question = quiz.value.questions.find((q) => q.id === questionId)
  if (!question) return false

  // For single choice questions
  const answerId = answerIds[0]
  const selectedOption = question.options.find((opt) => opt.id.toString() === answerId)
  return selectedOption ? selectedOption.isCorrect : false
}

// Lifecycle hooks
onMounted(() => {
  console.log('lessonId from route:', lessonId)
  if (!lessonId) {
    toast.error('Invalid lesson ID')
    return
  }
  fetchQuizData()
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// Watch for route changes to reload quiz if lessonId changes
watch(
  () => route.params.lessonId,
  (newLessonId) => {
    if (newLessonId && newLessonId !== lessonId) {
      fetchQuizData()
      retryQuiz()
    }
  }
)
</script>
  
<style scoped>
.quiz-container {
  width: 100%;
  margin: 0 auto;
  padding: 30px 50px;
  background-color: #f0f8ff;
  min-height: 900px;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.quiz-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

.quiz-timer {
  font-size: 1.2rem;
  font-weight: 600;
  color: #5c8984;
}

.quiz-timer.warning {
  color: #e74c3c;
  animation: pulse 1s infinite;
}

.quiz-progress {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-filled {
  height: 100%;
  background-color: #5c8984;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: right;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  font-size: 1.2rem;
  color: #666;
}

.loading-state i {
  margin-right: 0.5rem;
}

.question-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.question-container h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.4rem;
}

.answers-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.answer-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.answer-option:hover {
  background-color: #f5f5f5;
  border-color: #c0c0c0;
}

.answer-option.selected {
  border-color: #5c8984;
  background-color: #e6f2ff;
}

.answer-option.correct {
  border-color: #2ecc71;
  background-color: #e8f8f5;
}

.answer-option.incorrect {
  border-color: #e74c3c;
  background-color: #fdedec;
}

.option-letter {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
  margin-right: 1rem;
  font-weight: 600;
  color: #5f6469;
}

.option-text {
  flex: 1;
  font-size: 1rem;
}

.feedback-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-left: 1rem;
  color: white;
}

.feedback-icon.correct {
  background-color: #2ecc71;
}

.feedback-icon.incorrect {
  background-color: #e74c3c;
}

.feedback-container {
  background-color: #fff;
  border-radius: 8px;
  padding: l.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.feedback-message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.feedback-message.correct {
  background-color: #e8f8f5;
  border-left: 4px solid #2ecc71;
}

.feedback-message.incorrect {
  background-color: #fdedec;
  border-left: 4px solid #e74c3c;
}

.feedback-message h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.feedback-message p {
  margin: 0;
  line-height: 1.5;
}

.next-button {
  background-color: #5c8984;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  float: right;
  margin-top: 20px;
}

.next-button:hover {
  background-color: #4a6e6a;
}

/* Quiz Results Styles */
.quiz-results {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.results-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.results-header h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #264b47;
  font-size: 1.8rem;
}

.score-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.score {
  font-size: 2.5rem;
  font-weight: 700;
  display: flex;
  align-items: baseline;
}

.score-value {
  color: #ff0000;
}

.score-total {
  font-size: 1.8rem;
  color: #ff0000;
}

.percentage {
  margin-left: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #ff0000;
}

.pass-fail {
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.5rem 2rem;
  border-radius: 4px;
  display: inline-block;
  background-color: #e8f8f5;
  color: #2ecc71;
}

.pass-fail.failed {
  background-color: #fdedec;
  color: #e74c3c;
}

.pass-fail.pass {
  background-color: #e8f8f5;
  color: #2ecc71;
}

.results-review {
  margin-bottom: 2rem;
}

.results-review h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #252641;
  font-size: 1.4rem;
}

.review-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 1.5rem 0;
}

.review-item:first-child {
  padding-top: 0;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-question {
  display: flex;
}

.question-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #5c8984;
  border-radius: 50%;
  margin-right: 1rem;
  font-weight: 600;
  color: #ffffff;
  flex-shrink: 0;
}

.question-text {
  flex: 1;
}

.question-text h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #252641;
  font-size: 1.1rem;
}

.user-answer {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #fdedec;
  color: #e74c3c;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-answer.correct {
  background-color: #e8f8f5;
  color: #2ecc71;
}

.correct-answer {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #e8f8f5;
  color: #2ecc71;
}

.explanation {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #555;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.retry-button,
.back-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button {
  background-color: #5c8984;
  color: white;
  border: none;
}

.retry-button:hover {
  background-color: #4a6e6a;
}

.back-button {
  background-color: transparent;
  color: #5c8984;
  border: 2px solid #5c8984;
}

.back-button:hover {
  background-color: #f5f5f5;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .quiz-container {
    padding: 1rem;
  }

  .quiz-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .quiz-timer {
    margin-top: 1rem;
  }

  .score-container {
    flex-direction: column;
  }

  .percentage {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .retry-button,
  .back-button {
    width: 100%;
  }
}
</style>