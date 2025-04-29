<template>
  <transition name="fade">
    <div class="overlay" v-if="showQuizModal">
      <div class="modal">
        <h2 class="quiz-title">Quizizz</h2>
        <div class="quiz-content">

          <div class="quiz-title-wrapper">
            <input class="quiz-input quiz-title-input" v-model="quizData.title" placeholder="Quiz Title" />
          </div>

          <div class="quiz-info">
            <div class="quiz-item">
              <label class="quiz-label">Passing Score (%):</label>
              <input 
                class="quiz-input small-input" 
                v-model.number="quizData.passingScore" 
                type="number" 
                min="0" 
                max="100"
                placeholder="Score" />
            </div>
  
            <div class="quiz-item">
              <label class="quiz-label">Time Limit:</label>
              <input class="quiz-input small-input" v-model.number="quizData.timeLimit" type="number" min="1" placeholder="Minutes" />
            </div>
          </div>
          <textarea class="quiz-textarea" v-model="quizData.description" placeholder="Quiz Description"></textarea>
          
          <hr class="quiz-separator" />

          <div v-for="(question, qIndex) in quizData.questions" :key="qIndex" class="question-set">
            <div class="question-header">
              <div class="question-info">
                <span class="quiz-order">Question: {{ question.order }}</span>
                <span class="quiz-points">*10 points</span>
              </div>
              <button class="delete-button" @click="removeQuestion(qIndex)">
                <FontAwesomeIcon :icon="faTrash" />
              </button>
            </div>
            
            <div class="answers-list">
              <textarea class="quiz-input" v-model="question.question" placeholder="Question Text" />
              <div v-for="(option, index) in question.options" :key="index" class="answer-item">
                <input 
                  type="radio" 
                  :name="'correctAnswer-' + qIndex" 
                  :value="true" 
                  @change="setCorrectOption(qIndex, index)"
                  :checked="option.isCorrect" 
                />

                <textarea class="answer-input" v-model="option.text" placeholder="Answer Text"></textarea>
                <textarea class="answer-input" v-model="option.explanation" placeholder="Explanation"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="answer-item add-more" @click="addQuestion">
          <span class="plus-icon">+</span>
          <span class="add-text">Add Question</span>
        </div>

        <div class="action-buttons">
          <button class="cancel-btn" @click="cancelQuiz">Cancel</button>
          <!-- <button class="delete-btn" @click="handleDelete">Delete</button> -->
          <button class="save-btn" @click="saveQuiz">{{ isEditMode ? 'Update' : 'Create' }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineOptions({
  name: 'QuizModal'
});
import { ref, onMounted, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { IQuiz, IOption, IQuestion } from '../types/quizz';
import { useQuizStore } from '../store/quizStore';

// Props & Emits
const props = defineProps<{
  showQuizModal: boolean;
  lessonId: number;
  quizId?: string; 
  onSave: (quizData: IQuiz) => void;

}>(); 
const emit = defineEmits(['update:showQuizModal', 'saveQuiz']);

// Store & Router
const quizStore = useQuizStore();

// Local States
const quizData = ref<IQuiz>({
  title: '',
  description: '',
  lessonId: props.lessonId,
  passingScore: 70,
  timeLimit: 30,
  questions: []
});
const isEditMode = computed(() => !!quizId); 

// Functions
const createEmptyOptions = (): IOption[] => {
  return Array.from({ length: 4 }, (_, index) => ({
    id: index + 1,
    text: '',
    isCorrect: false,
    explanation: ''
  }));
};

const loadQuiz = async () => {
  if (props.lessonId) {
    await quizStore.fetchQuizByLessonId(props.lessonId);
    if (quizStore.selectedQuiz) {
      quizData.value = JSON.parse(JSON.stringify(quizStore.selectedQuiz));
      quizData.value.questions.forEach((question: IQuestion, index: number)=> {
        question.order = index + 1;
      });
      console.log('Loaded quiz data:', quizData.value); 
    } else {
      console.warn('No quiz found for this lesson');
    }
  } else {
    console.warn('lessonId is missing or invalid');
  }
};

const addQuestion = () => {
  const nextOrder = quizData.value.questions.length + 1;
  quizData.value.questions.push({
    question: '',
    points: 10,
    order: nextOrder,
    options: createEmptyOptions()
  });
};

const removeQuestion = (index: number) => {
  quizData.value.questions.splice(index, 1);
  quizData.value.questions.forEach((q: IQuestion, i: number) => {
    q.order = i + 1;
    q.points = 1;
  });
};

const cancelQuiz = () => {
  emit('update:showQuizModal', false);  
};

const setCorrectOption = (qIndex: number, optionIndex: number) => {
  quizData.value.questions[qIndex].options.forEach((opt: IOption, idx: number) => {
    opt.isCorrect = idx === optionIndex;  
  });
};

const saveQuiz = async () => {
  try {
    const cleanedQuestions = quizData.value.questions.map((question: IQuestion, qIndex: number) => ({
      question: question.question,
      points: question.points || 10,
      order: qIndex + 1,
      options: question.options.map((option: IOption) => ({
        text: option.text,
        isCorrect: option.isCorrect,
        explanation: option.explanation?.trim() || '',
      })),
    }));

    const cleanedQuiz = {
      title: quizData.value.title,
      description: quizData.value.description,
      lessonId: props.lessonId,
      passingScore: quizData.value.passingScore,
      timeLimit: quizData.value.timeLimit,
      questions: cleanedQuestions,
    };

    if (isEditMode.value && quizId) {
      await quizStore.updateQuiz(Number(quizId), cleanedQuiz);
    } else {
      await quizStore.createQuizForLesson(props.lessonId, cleanedQuiz);
    }
    props.onSave(cleanedQuiz);
    emit('saveQuiz');
    emit('update:showQuizModal', false);
  } catch (error) {
    console.error('Error saving quiz:', error);
  }
};
const quizId = props.quizId;

onMounted(loadQuiz);

// const handleDelete = async () => {
//   if (quizId && confirm('Are you sure you want to delete this quiz?')) {
//     try {
//       await quizStore.deleteQuiz(quizId);
//       emit('update:showQuizModal', false);
//       alert('Quiz deleted successfully');
//     } catch (err) {
//       console.error('Failed to delete quiz:', err);
//     }
//   }
// };

</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 16px;
  max-width: 1000px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  margin-top: 60px;
  max-height: 85vh; 
  display: flex;
  flex-direction: column;
}

.quiz-content{
  overflow-y: auto;
  padding-right: 8px;
  flex-grow: 1;
  min-height: 0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px;
}

.quiz-order {
  font-weight: bold;
  color: #444;
  margin-right: 8px;
}

.quiz-points {
  color: #666;
  margin-left: 8px;
}

.delete-button {
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  color: #6c9d8f;
  font-size: 18px;
}

.delete-button:hover {
  color: #5a8a7d;
}

.quiz-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.quiz-title-wrapper {
  display: flex;
  justify-content: center;
}

.quiz-input {
  display: block;
  border: 1px solid #aaa;
  border-radius: 16px;
  padding: 10px 14px;
  margin: 8px 0;
  outline: none;
  resize: none;

  align-content: center;
}

.quiz-title-input {
  text-align: center;
}

.quiz-info {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 12px 0;
}

.quiz-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.quiz-label {
  margin-bottom: 4px;
  font-weight: bold;
}

.small-input {
  padding: 10px 14px;
  border: 1px solid #aaa;
  border-radius: 16px;
}

.quiz-textarea {
  width: 100%;
  border: 1px solid #aaa;
  border-radius: 16px;
  padding: 12px 14px;
  resize: none;
  margin: 8px 0;
  text-align: center;
  align-content: center;
}

.quiz-separator {
  border: none;
  border-top: 1px solid #ddd;
  margin: 40px 0;
}

.quiz-input,
.quiz-textarea,
.answer-input,
.answer-item {
  background-color: white;
}

.question-set{
  border: 1px solid #ccc;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 50px;
  background-color: #f8f7f7;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-item {
  display: flex;
  align-items: center;
  border: 1px solid #aaa;
  border-radius: 16px;
  padding: 8px 12px;
  margin-bottom: 8px;
}

.answer-item input[type="radio"] {
  width: 20px;
  height: 20px;
  accent-color: #6c9d8f;
  cursor: pointer;
}

.answer-input {
  flex-grow: 1;
  border: none;
  outline: none;
  background: transparent;
  align-content: center;
  margin-left: 10px;
  resize: none;
}

.add-more {
  cursor: pointer;
  justify-content: center;
  border: 1px dashed #aaa;
  transition: all 0.3s ease;

}

.add-more .plus-icon {
  margin-right: 8px;
  font-weight: bold;
}

.add-more:hover {
  cursor: pointer;
  background-color: #e6f4f1;
  transform: scale(1.01);

}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn, .save-btn, .delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
}

.cancel-btn {
  background: #999;
  color: white;
}

.save-btn {
  background: #4D756C;
  color: white;
}

.delete-btn {
  background: #ff4d4d;
  color: white;
}
</style>