<template>
    <div class="quiz-page">
      <div class="main-container">
        <!-- Sidebar -->
         
        <div class="sidebar-layout">
        <div class="menu-container">
          <button 
            v-for="menu in menuItems"
            :key="menu.id"
            class="menu-btn"
            :class="{ 'active': activeSection === menu.id }"
            @click="setActiveSection(menu.id)"
          >
            <FontAwesomeIcon :icon="menu.icon" />
            {{ menu.label }}
          </button>
        </div>
      </div>
        
        <!-- Main Content -->
         
        <div class="content">
          <div class="modal">
            <BackButton />
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
              <div class="answer-item add-more" @click="addQuestion">
                    <span class="plus-icon">+</span>
                    <span class="add-text">Add Question</span>
                </div>
              <div class="quiz-actions">
                <button @click="saveQuiz" class="save-btn">
                {{ isEditMode ? 'Update Quiz' : 'Create Quiz' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts" >
  import { ref, onMounted, computed } from 'vue';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { faBook, faGear, faTrash} from '@fortawesome/free-solid-svg-icons';
  import { useRoute, useRouter } from 'vue-router';
  import { toast } from 'vue3-toastify';
  import { useQuizStore } from '../../store/quizStore';
  import type { IMenuItem } from '../../types/lesson'
  import type { IOption, IQuestion } from '../../types/quizz';
  import BackButton from '../../components/BackButton.vue';

  const route = useRoute();
  const router = useRouter();
  const quizStore = useQuizStore();

  const lessonId = Number(route.params.lessonId);
  const quizId = ref<number | null>(Number(route.params.quizId) || null);
  const isEditMode = ref(!!quizId.value);

  const menuItems: IMenuItem[] = [
  { id: 'course', icon: faBook, label: 'Course' },
  { id: 'settings', icon: faGear, label: 'Settings' }
];

  const activeSection = ref<string>('course');
  const setActiveSection = (section: string): void => {
  if (section === 'settings') {
    router.push('/setting-teacher');
  } else {
    activeSection.value = section;
  }
};

  interface Question {
    question: string;
    points: number;
    order: number;
    options: { text: string; isCorrect: boolean; explanation: string }[];
  }
  
  const quizData = ref<{
    title: string;
    passingScore: number;
    timeLimit: number;
    description: string;
    questions: Question[];
  }>({
    title: '',
    passingScore: 70,
    timeLimit: 30,
    description: '',
    questions: [],
  });
  
  const createEmptyOptions = (): IOption[] => {
  return Array.from({ length: 4 }, (_, index) => ({
    id: index + 1,
    text: '',
    isCorrect: false,
    explanation: ''
  }));
};

  const setCorrectOption = (qIndex: number, optionIndex: number) => {
  quizData.value.questions[qIndex].options.forEach((opt: IOption, idx: number) => {
    opt.isCorrect = idx === optionIndex;  
  });
};

const addQuestion = () => {
  const nextOrder = quizData.value.questions.length + 1;
  const newQuestion = {
    question: '',
    points: 10,
    order: nextOrder,
    options: createEmptyOptions()
  };
  
  // Đảm bảo tùy chọn đầu tiên được đánh dấu là đúng theo mặc định
  if (newQuestion.options && newQuestion.options.length > 0) {
    newQuestion.options[0].isCorrect = true;
  }
  
  quizData.value.questions.push(newQuestion);
  
  console.log('Đã thêm câu hỏi mới:', newQuestion);
  console.log('Danh sách câu hỏi hiện tại:', quizData.value.questions);
};

const removeQuestion = (index: number) => {
  quizData.value.questions.splice(index, 1);
  quizData.value.questions.forEach((q: IQuestion, i: number) => {
    q.order = i + 1;
    q.points = 1;
  });
};

const fetchQuiz = async () => {
  if (quizId.value) {
    try {
      console.log('Đang tải quizz với ID:', quizId.value);
      await quizStore.fetchQuizById(quizId.value.toString()); 
      const fetchedQuiz = quizStore.selectedQuiz; 
      console.log('Dữ liệu quizz từ store:', fetchedQuiz);
      
      if (fetchedQuiz) {
        // Gán toàn bộ dữ liệu như một đối tượng mới thay vì cập nhật từng thuộc tính
        quizData.value = {
          title: fetchedQuiz.title || '',
          passingScore: fetchedQuiz.passingScore || 70,
          timeLimit: fetchedQuiz.timeLimit || 30,
          description: fetchedQuiz.description || '',
          questions: fetchedQuiz.questions?.map((question: IQuestion, index: number) => ({
            question: question.question || '',
            points: question.points || 10,
            order: index + 1,
            options: question.options?.map((option: IOption) => ({
              text: option.text || '',
              isCorrect: option.isCorrect || false,
              explanation: option.explanation || ''
            })) || createEmptyOptions(),
          })) || []
        };
        
        console.log('Đã tải dữ liệu quizz vào component:', quizData.value);
        isEditMode.value = true;
      } else {
        console.warn('Không tìm thấy dữ liệu quizz trong store');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to fetch quiz data');
    }
  } else {
    // Đảm bảo quizData có cấu trúc đúng ngay cả khi không có dữ liệu
    quizData.value = {
      title: '',
      passingScore: 70,
      timeLimit: 30,
      description: '',
      questions: [],
    };
  }
};

const saveQuiz = async () => {
  try {
    const cleanedQuizData = {
      title: quizData.value.title.trim(),
      description: quizData.value.description.trim(),
      passingScore: quizData.value.passingScore || 70,
      timeLimit: quizData.value.timeLimit || 0,
      lessonId: lessonId, 
      questions: quizData.value.questions.map((question, index) => ({
        question: question.question.trim(),
        points: question.points || 1,
        order: index + 1,
        options: question.options.map((option) => ({
          text: option.text.trim(),
          isCorrect: option.isCorrect,
          explanation: option.explanation?.trim() || '',
        })),
      })),
    };

    console.log('Cleaned Quiz Data:', cleanedQuizData);

    if (quizId.value) {
      await quizStore.updateQuiz(quizId.value, cleanedQuizData);
      toast.success('Quiz updated successfully!');
    } else {
      const createdQuiz = await quizStore.createQuizForLesson(lessonId, cleanedQuizData);
      quizId.value = createdQuiz.id;    // gán lại quizId reactive
      isEditMode.value = true;
      
      // Lưu lại dữ liệu vào quizData để đảm bảo cập nhật đúng
      await fetchQuiz();
      
      toast.success('Quiz created successfully!');
    }
    router.go(-1);
  } catch (error) {
    console.error('Error saving quiz:', error);
    toast.error('Failed to save quiz');
  }
};

  onMounted(() => {
    fetchQuiz();
  });
</script>

  <style scoped>
    .quiz-page {
    width: 100%;
    /* min-height: 120vh; */
    display: flex;
    flex-direction: column;
    align-items: center;
    }

    .main-container {
  display: flex;
  align-items: flex-start;
  min-height: calc(100vh - 160px);
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  max-width: 1200px;
  gap: 20px;
}

.sidebar-layout {
  position: sticky;
  top: 80px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 220px;
  flex-shrink: 0;
}

.menu-container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border: 2px solid #6c9d8f;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.menu-btn.active,
.menu-btn:hover {
  background-color: #6c9d8f;
  color: white;
}

  .modal {
    background: white;
    padding: 24px;
    border-radius: 16px;
    max-width: 1200px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    max-height: 85vh; 
    display: flex;
    flex-direction: column;
  }

  .content {
  flex-grow: 1; 
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  
  .quiz-actions {
  display: flex;
  justify-content: flex-end; 
  gap: 12px; 
  margin-top: 20px; 
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
  
  .question-input {
  width: 100%;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  resize: none;
}

.explanation-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
  resize: none;
}

.answer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.answer-input {
  flex-grow: 1;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 8px;
}

.delete-button {
  background: transparent;
  border: none;
  color: #ff4d4d;
  cursor: pointer;
  font-size: 16px;
}

.delete-button:hover {
  color: #d43f3f;
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
  
  .save-btn, .delete-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
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