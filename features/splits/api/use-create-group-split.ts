import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/hono"

type CreateGroupSplitPayload = {
  groupId: number
  payerId: number
  totalAmount: number
  selectedUserIds: number[]
}

export const useCreateGroupSplit = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: CreateGroupSplitPayload) => {
      const response = await client.api.split["create"].$post({
        json: payload,
      })

      if (!response.ok) {
        throw new Error("Failed to create group split.")
      }

      const  data  = await response.json()
      return data
    },
    onSuccess: () => {
        //   queryClient.invalidateQueries(["groupSplits"])
    },
  })

  return mutation
}
