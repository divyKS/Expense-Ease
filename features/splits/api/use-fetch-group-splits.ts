import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/hono"

export const useFetchGroupSplits = (groupId?: string) => {
  const query = useQuery({
    enabled: !!groupId, // Only fetch if groupId is provided
    queryKey: ["groupSplits", { groupId }],
    queryFn: async () => {
      if (!groupId) {
        throw new Error("Group ID is required to fetch group splits.")
      }

      const response = await client.api.split["group-splits"].$get({
        query: { groupId },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch group splits.")
      }

      const { data } = await response.json()
      return data
    },
  })

  return query
}
