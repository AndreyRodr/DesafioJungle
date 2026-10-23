import { isAxiosError } from 'axios'
export function apiErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? 'Falha ao comunicar com o serviço.'
  return 'Ocorreu um erro. Tente novamente.'
}
