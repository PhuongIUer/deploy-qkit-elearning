import { faBook, faGear} from '@fortawesome/free-solid-svg-icons';
export type listLesson = ILesson[]

export interface ILesson {
  id: number
  title: string
  description: string
  position: number
  videoUrl: string
  duration: number
}

export interface IChapter {
    id: number;
    title: string;
    description: string;
    totalLessons: number;
    totalDuration: number;
  }
  
export interface IMenuItem {
    id: string;
    icon: typeof faBook | typeof faGear; 
    label: string;
  }