import { useMutation } from "@tanstack/react-query"
import { client } from "@/lib/hono"

type TogglePaidPayload = {
  splitId: number,
  paid: boolean
}

export const useTogglePaid = () => {
  const mutation = useMutation({
    mutationFn: async (payload: TogglePaidPayload) => {
      const response = await client.api.split["toggle-paid"].$patch({
        json: payload,
      })

      if (!response.ok) {
        throw new Error("Failed to toggle paid status.")
      }

      const { data } = await response.json()
      return data
    },
  })

  return mutation
}
