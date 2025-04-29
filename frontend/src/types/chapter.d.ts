export type ChapterRespone = IChapter[]

export interface IChapter {
  id: number
  title: string
  position: number
  totalLessons: number
  totalDuration: number
  lessons: Lesson[]
}

export interface Lesson {
  id: number
  title: string
  description: string
  position: number
  videoUrl: string
  duration: number
}


export interface IChapterCreate {
  title: string
  position: number
}
