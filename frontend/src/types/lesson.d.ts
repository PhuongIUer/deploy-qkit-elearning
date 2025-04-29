import { faBook, faGear} from '@fortawesome/free-solid-svg-icons';
import type { IQuiz } from './quizz';

export type listLesson = ILesson[]

export interface ILesson {
  id: number
  title: string
  description: string
  position: number
  videoUrl: string
  duration: number
  quizzes?: IQuiz[]
}

export interface IChapter {
    id: number;
    title: string;
    description: string;
    totalLessons: number;
    totalDuration: number;
    lessons?: ILesson[];
  }
  
export interface IMenuItem {
    id: string;
    icon: typeof faBook | typeof faGear; 
    label: string;
  }