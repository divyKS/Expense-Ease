'use client'
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"
import { useNewUser } from "../hooks/use-new-user"
import { useCreateUser } from "../api/use-create-user"

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

type UserFormValues = z.infer<typeof userFormSchema>

export const NewUserSheet = () => {
  const { isOpen, onClose } = useNewUser()

  const userMutation = useCreateUser()

  const isPending = userMutation.isPending

  const [name, setName] = useState<string>("")

  const onSubmit = (values: UserFormValues) => {
    userMutation.mutate(values, { onSuccess: onClose })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name })
  }

  return (
    <Sheet open={isOpen || isPending} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Add New User</SheetTitle>
          <SheetDescription>Add a new person to split expenses with.</SheetDescription>
        </SheetHeader>

        {isPending ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-blue-300"
            >
              {isPending ? "Saving..." : "Create User"}
            </button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
