// import {
//   tasksWithProjectsQuery,
//   taskQuery,
//   updateTaskQuery,
//   deleteTaskQuery
// } from '@/services/supabase/queries'
// import { useMemoize } from '@vueuse/core'
// import type { Task, TasksWithProjects } from '@/services/supabase/queries'

// export const useTasksStore = defineStore('tasks-store', () => {
//   const tasks = ref<TasksWithProjects | null>(null)
//   const task = ref<Task | null>(null)
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const loadTasks = useMemoize(async (_key: string) => await tasksWithProjectsQuery)
//   const loadTask = useMemoize(async (key: number) => await taskQuery(key))

//   interface ValidateCacheParams {
//     ref: typeof tasks | typeof task
//     query: typeof tasksWithProjectsQuery | typeof taskQuery
//     key: number | string
//     loaderFn: typeof loadTasks | typeof loadTask
//   }

//   const validateCache = ({ ref, query, key, loaderFn }: ValidateCacheParams) => {
//     if (ref.value) {
//       const finalQuery = typeof query === 'function' ? query(key as number) : query

//       finalQuery.then(({ data, error }) => {
//         if (JSON.stringify(ref.value) === JSON.stringify(data)) {
//           return
//         } else {
//           if (loaderFn === loadTask) {
//             loaderFn.delete(key as number)
//           } else if (loaderFn === loadTasks) {
//             loaderFn.delete(key as string)
//           }
//           if (!error && data) ref.value = data
//         }
//       })
//     }
//   }

//   const getTasks = async () => {
//     tasks.value = null

//     const { data, error, status } = await loadTasks('tasks')

//     if (error) useErrorStore().setError({ error, customCode: status })

//     if (data) tasks.value = data

//     validateCache({ ref: tasks, query: tasksWithProjectsQuery, key: 'tasks', loaderFn: loadTasks })
//   }

//   const getTask = async (id: number) => {
//     task.value = null

//     const { data, error, status } = await loadTask(id)

//     if (error) useErrorStore().setError({ error, customCode: status })

//     if (data) task.value = data

//     validateCache({ ref: task, query: taskQuery, key: id, loaderFn: loadTask })
//   }

//   const updateTask = async () => {
//     if (!task.value) return

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const { projects, id, ...taskProperties } = task.value

//     await updateTaskQuery(taskProperties, task.value.id)
//   }

//   const deleteTask = async () => {
//     if (!task.value) return
//     const { error } = await deleteTaskQuery(task.value.id)
//   }

//   return {
//     tasks,
//     task,
//     getTasks,
//     getTask,
//     updateTask,
//     deleteTask
//   }
// })
