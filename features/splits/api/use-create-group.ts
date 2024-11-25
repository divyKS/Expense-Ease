import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"
import { toast } from "sonner"

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<(typeof client.api.split)["create-group"]["$post"]>
type RequestType = InferRequestType<(typeof client.api.split)["create-group"]["$post"]>["json"]

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.split["create-group"]["$post"]({
        json,
      })
      return await response.json()
    },
    onSuccess: () => {
      toast.success("Group created successfully.")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
    onError: () => {
      toast.error("Failed to create group.")
    },
  })

  return mutation
}
