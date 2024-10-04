import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"

import { client } from "@/lib/hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<typeof client.api.categories['bulk-delete']['$post']>
type RequestType = InferRequestType<typeof client.api.categories['bulk-delete']['$post']>['json']

export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.categories['bulk-delete']['$post']({json})
      return await response.json()
    },
    onSuccess: () => {
      toast.success("Categories delete.")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      // invalidate whatever else might be needed after deletion          
    },
    onError: () => {
      toast.error("Failed to delete categories.")
    },
  })

  return mutation
}