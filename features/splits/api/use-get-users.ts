import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/hono"

export const useGetUsers = () => {
  const query = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await client.api.split["users"].$get()

      if (!response.ok) {
        throw new Error("Failed to fetch users.")
      }

      const  data  = await response.json()
      return data
    },
  })

  return query
}
