import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"

import { client } from "@/lib/hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<typeof client.api.accounts.$post>
type RequestType = InferRequestType<typeof client.api.accounts.$post>["json"]

export const useCreateAccount = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.accounts.$post({ json })
      return await response.json()
    },
    onSuccess: () => {
      toast.success("Account created.")
      queryClient.invalidateQueries({ queryKey: ["accounts"] }) // because of this the use-get-accounts hook re-fetches every time we create an account
    },
    onError: () => {
      toast.error("Failed to create account.")
    },
  })

  return mutation
}