import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useNewGroup } from "../hooks/use-new-group";
import { useGetUsers } from "../api/use-get-users";
import { useCreateGroup } from "../api/use-create-group";

export const NewGroupSheet = () => {
  const { isOpen, onClose } = useNewGroup(); // Zustand store to control the visibility of the sheet
  const { data: users, isLoading } = useGetUsers(); // Fetch users list
  const groupMutation = useCreateGroup(); // Group creation logic
  const isGroupLoading = groupMutation.isPending;

  const { register, handleSubmit, reset } = useForm();
  const [participants, setParticipants] = useState<number[]>([]); // Selected user IDs

  const onSubmit = (data: any) => {
    groupMutation.mutate({
      name: data.groupName, // Group name from the form
      // @ts-ignore
      userIds: [participants[0], ...participants.slice(1)], // Selected participants
    });
    reset(); // Reset the form
    setParticipants([]); // Clear selected participants
    onClose(); // Close the sheet
  };

  const handleParticipantToggle = (userId: number) => {
    setParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Create New Group</SheetTitle>
          <SheetDescription>Create a group and add participants to split expenses.</SheetDescription>
        </SheetHeader>

        {isLoading || isGroupLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Group Name Input */}
            <div className="space-y-1">
              <label htmlFor="groupName" className="block text-sm font-medium">
                Group Name
              </label>
              <Input
                {...register("groupName", { required: true })}
                id="groupName"
                placeholder="Enter group name"
              />
            </div>

            {/* Participants Selection */}
            <div className="space-y-1">
              <label htmlFor="participants" className="block text-sm font-medium">
                Select Participants
              </label>
              <div className="space-y-2">
                {users?.map((user) => (
                  <div key={user.user_id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`participant-${user.user_id}`}
                      value={user.user_id}
                      checked={participants.includes(user.user_id)}
                      onChange={() => handleParticipantToggle(user.user_id)}
                      className="mr-2"
                    />
                    <label htmlFor={`participant-${user.user_id}`} className="text-sm">
                      {user.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isGroupLoading}>
              {isGroupLoading ? "Creating Group..." : "Create Group"}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};

