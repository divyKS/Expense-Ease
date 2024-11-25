import { useMutation, useQueryClient } from "@tanstack/react-query"

import { client } from "@/lib/hono"

export const useAddMemberToGroup = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      groupId,
      userId,
    }: {
      groupId: string,
      userId: number
    }) => {
      const response = await client.api.split[":groupId"].$post({
        param: { groupId },
        json: { userId },
      })

      if (!response.ok) {
        throw new Error("Failed to add member to the group.")
      }

      return response.json()
    },
    onSuccess: (_, { groupId }) => {
      // Invalidate group members cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["groupMember", { groupId }] })
    },
  })

  return mutation
}
