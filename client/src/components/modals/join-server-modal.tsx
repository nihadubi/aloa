import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useUser } from "@clerk/clerk-react";
import { useServerStore } from "@/hooks/use-server-store";

const formSchema = z.object({
  inviteCode: z.string().min(1, {
    message: "Invite code is required.",
  }),
});

export const JoinServerModal = () => {
  const { isOpen, onClose, type } = useModal();
  const { user } = useUser();
  const { addServer } = useServerStore();
  
  const isModalOpen = isOpen && type === "joinServer";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/servers/join/${values.inviteCode}`,
        { userId: user.id }
      );

      // Add the server to the store
      addServer(response.data.server);

      form.reset();
      onClose();
    } catch (error: any) {
      console.log(error);
      const errorMessage = error.response?.data?.message || "Failed to join server";
      form.setError("inviteCode", { message: errorMessage });
    }
  }

  const handleClose = () => {
    form.reset();
    onClose();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Join a Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Enter the invite code to join an existing server.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="inviteCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Invite Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter invite code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading} variant="default">
                Join
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
