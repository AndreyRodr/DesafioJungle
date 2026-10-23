import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listFavorites, setFavorite } from '@/features/auth/api/auth'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useFavorites() {
  const { user } = useAuth()
  return useQuery({ queryKey: ['favorites', user?.id], queryFn: listFavorites, enabled: Boolean(user), retry: false })
}
export function useFavoriteActions() {
  const client = useQueryClient()
  const { user } = useAuth()
  const key = ['favorites', user?.id]
  return useMutation({
    mutationFn: setFavorite,
    onMutate: async ({ id, favorite }) => {
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueryData<string[]>(key)
      client.setQueryData<string[]>(key, (list = []) => favorite ? [...new Set([...list, id])] : list.filter((value) => value !== id))
      return { previous }
    },
    onError: (_error, _input, context) => client.setQueryData(key, context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })
}
