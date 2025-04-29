export interface IQuiz {
    title: string
    description: string
    lessonId: number
    passingScore: number
    timeLimit: number
    questions: Question[]
  }
  
  export interface IQuestion {
    question: string
    points: number
    order: number
    options: IOption[]
  }
  
  export interface IOption {
    text: string
    isCorrect: boolean
    explanation: string
  }

  export interface IQui extends IQuiz{
    id: number; 
  }