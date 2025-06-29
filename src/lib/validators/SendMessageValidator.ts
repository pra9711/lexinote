import { z } from 'zod'

export const SendMessageValidator = z.object({
  fileId: z.string(),
  message: z.string().min(1).max(2000)
})

export type SendMessageRequest = z.infer<typeof SendMessageValidator>