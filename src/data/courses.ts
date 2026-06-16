import coursesRaw from '@data/courses.json'
import type { Course } from '@/types'

/** Course summaries (study mode). Loaded only by the Study view's chunk. */
export const COURSES = coursesRaw as Course[]
