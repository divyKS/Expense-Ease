import { useMutation } from "@tanstack/react-query"
import { client } from "@/lib/hono"

type ToggleTransactionStatusPayload = {
  transactionId: number,
  status: "pending" | "complete"
}

export const useToggleTransactionStatus = () => {
  const mutation = useMutation({
    mutationFn: async (payload: ToggleTransactionStatusPayload) => {
      const response = await client.api.split["toggle-transaction-status"].$patch({
        json: payload,
      })

      if (!response.ok) {
        throw new Error("Failed to toggle transaction status.")
      }

      const { data } = await response.json()
      return data
    },
  })

  return mutation
}
