
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadcnCardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UploadCloud, FileText } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", // .txt
];
const MIN_CV_TEXT_LENGTH = 100; // Minimum characters for pasted CV

// import pdfToText from "react-pdftotext";

async function readFileAsText(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    // only import in the browser
    const { default: pdfToText } = await import("react-pdftotext");
    return await pdfToText(file);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

const formSchema = z.object({
  jobDescription: z.string().min(50, {
    message: "Job description must be at least 50 characters.",
  }),
  cvInputMethod: z.enum(["file", "text"]).default("file"),
  cvFile: z.instanceof(File).optional(),
  cvText: z.string().optional(),
})
.superRefine((data, ctx) => {
  if (data.cvInputMethod === "file") {
    if (!data.cvFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CV file is required when 'Upload File' is selected.",
        path: ["cvFile"],
      });
    } else {
      if (data.cvFile.size > MAX_FILE_SIZE) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Max file size is 5MB.`, path: ["cvFile"] });
      }
      if (!ACCEPTED_MIME_TYPES.includes(data.cvFile.type)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid file type. Accepted formats: .pdf, .doc, .docx, .txt", path: ["cvFile"] });
      }
    }
  } else if (data.cvInputMethod === "text") {
    if (!data.cvText || data.cvText.trim().length < MIN_CV_TEXT_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Pasted CV text must be at least ${MIN_CV_TEXT_LENGTH} characters.`,
        path: ["cvText"],
      });
    }
  }
});

type DocumentUploadFormValues = z.infer<typeof formSchema>;

type DocumentUploadFormProps = {
  onSubmit: (jobDescription: string, cvText: string) => Promise<void>;
  isLoading: boolean;
};

export function DocumentUploadForm({ onSubmit, isLoading }: DocumentUploadFormProps) {
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
      cvInputMethod: "file",
      cvFile: undefined,
      cvText: "",
    },
  });

  const handleFormSubmit = async (data: DocumentUploadFormValues) => {
    let cvContent = "";
    if (data.cvInputMethod === "file" && data.cvFile) {
      cvContent = await readFileAsText(data.cvFile);
    } else if (data.cvInputMethod === "text" && data.cvText) {
      cvContent = data.cvText;
    }
    // Ensure cvContent is not empty before submitting, though zod validation should catch this.
    if (!cvContent.trim() && (data.cvInputMethod === "text" || (data.cvInputMethod === "file" && !data.cvFile ))) {
        // This case should ideally be prevented by Zod validation.
        // If Zod fails, set an error on the relevant field.
        if (data.cvInputMethod === "file") {
            form.setError("cvFile", { type: "manual", message: "CV is required."});
        } else {
            form.setError("cvText", { type: "manual", message: "CV text is required."});
        }
        return;
    }
    await onSubmit(data.jobDescription, cvContent);
  };

  const cvInputMethod = form.watch("cvInputMethod");

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UploadCloud className="h-8 w-8 text-primary" />
          Upload Documents
        </CardTitle>
        <ShadcnCardDescription>
          Paste the job description and provide the candidate's CV to generate interview questions.
        </ShadcnCardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the full job description here..."
                      className="min-h-[200px] resize-y"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvInputMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg">Candidate's CV</FormLabel>
                  <FormControl>
                    <Tabs
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value as "file" | "text");
                        // Reset other field when switching tabs
                        if (value === "file") {
                          form.resetField("cvText");
                        } else {
                          form.resetField("cvFile");
                        }
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file" disabled={isLoading}>
                          <UploadCloud className="mr-2 h-4 w-4" /> Upload File
                        </TabsTrigger>
                        <TabsTrigger value="text" disabled={isLoading}>
                          <FileText className="mr-2 h-4 w-4" /> Paste Text
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="file" className="mt-4">
                        <FormField
                          control={form.control}
                          name="cvFile"
                          render={({ field: fileField }) => (
                            <FormItem>
                              <FormLabel >CV File</FormLabel>
                              <FormControl>
                                <Input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.txt"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    fileField.onChange(file || undefined);
                                  }}
                                  disabled={isLoading || cvInputMethod !== "file"}
                                  className="pt-2"
                                />
                              </FormControl>
                              <FormDescription>
                                Upload CV as .pdf, .doc, .docx, or .txt (max 5MB).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="text" className="mt-4">
                        <FormField
                          control={form.control}
                          name="cvText"
                          render={({ field: textField }) => (
                            <FormItem>
                               <FormLabel >CV Text</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={`Paste the candidate's CV content here (min ${MIN_CV_TEXT_LENGTH} characters)...`}
                                  className="min-h-[200px] resize-y"
                                  {...textField}
                                  disabled={isLoading || cvInputMethod !== "text"}
                                />
                              </FormControl>
                              <FormDescription>
                                Ensure the pasted text is comprehensive for best results.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                  <FormMessage /> {/* For cvInputMethod if needed, though unlikely */}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                "Generate Interview Questions"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
