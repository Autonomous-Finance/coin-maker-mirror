import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateToken } from "@/hooks/use-create-token";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function CreateTokenSocialMedia() {
  const { token, setToken } = useCreateToken();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const navigate = useNavigate();

  const formSchema = z.object({
    Telegram: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^https:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,}$/.test(value),
        {
          message:
            "Please provide a valid Telegram URL (e.g., https://t.me/username)",
        }
      ),
    Twitter: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^https:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}$/.test(value),
        {
          message:
            "Please provide a valid Twitter/X URL (e.g., https://twitter.com/username)",
        }
      ),
    Website: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(
            value
          ),
        {
          message: "Please provide a valid URL",
        }
      ),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Set new token values
      setToken({
        ...token,
        ...values,
      });

      navigate({
        to: "/create-token/distribution",
      });

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("🚫 Form could not be submitted", {
        description:
          "An error occurred while validating your inputs. Please check them and retry.",
      });
      setIsLoading(false);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: token,
  });

  return (
    <div className="container">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div
            className={cn(
              "max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-2 space-y-12",
              isLoading ? "opacity-50" : null
            )}
          >
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-lg font-bold">
                Social Media
              </legend>
              <p className="text-sm text-muted-foreground">
                Setup your Telegram, Twitter, and website links.
              </p>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Telegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://t.me/test" {...field} />
                      </FormControl>
                      <FormDescription>Add the telegram link.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X</FormLabel>
                      <FormControl>
                        <Input placeholder="https://x.com/test" {...field} />
                      </FormControl>
                      <FormDescription>
                        Add the token X profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://test.com" {...field} />
                      </FormControl>
                      <FormDescription>Add the token Website.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>
          </div>
          <div className="w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-4 flex flex-col space-y-12 max-w-lg">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => router.history.back()}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex flex-grow items-center gap-2"
              >
                {isLoading ? (
                  "Saving details..."
                ) : (
                  <>
                    Continue to Distribution
                    <ChevronRight />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
