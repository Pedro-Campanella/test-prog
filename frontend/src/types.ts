export type User = {
  id: number
  email: string
}

export type Job = {
  id: number
  title: string
  description: string
  owner_id: number
  created_at: string
}

export type Application = {
  id: number
  user_id: number
  job_id: number
  job?: Job
  created_at: string
}
