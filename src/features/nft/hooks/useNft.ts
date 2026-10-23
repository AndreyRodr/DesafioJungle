import { useQuery } from '@tanstack/react-query'
import { getNft } from '../api/getNft'

export function useNft(id: string) {
  return useQuery({
    queryKey: ['nft', id],
    queryFn: ({ signal }) => getNft(id, signal),
    retry: false,
  })
}
