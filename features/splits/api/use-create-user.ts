import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/hono"

type CreateUserPayload = {
  name: string
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const response = await client.api.split["create-user"].$post({
        json: payload,
      })

      if (!response.ok) {
        throw new Error("Failed to create user.")
      }

      const  data  = await response.json()
      return data
    },
    onSuccess: () => {
      // Invalidate the "users" query to fetch updated user list
      queryClient.invalidateQueries({queryKey: ["users"]})
    },
  })

  return mutation
}
