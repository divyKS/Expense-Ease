import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useFetchGroupMembers = (groupId: string) => {
  const query = useQuery({
    enabled: !!groupId, // Enable the query only if groupId is provided
    queryKey: ["groupMembers", { groupId }],
    queryFn: async () => {
      const response = await client.api.split[":groupId"].$get({
        param: { groupId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch group members.");
      }

      const { members } = await response.json();

      return members;
    },
  });

  return query;
};
