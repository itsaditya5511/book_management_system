"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { bookAPI } from "@/lib/api";
import { BOOK_CATEGORIES, Book } from "@/lib/types";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  author: z.string().min(1, "Author is required").max(200),
  isbn: z.string().min(10).max(17),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  published_date: z.string().min(1, "Published date is required"),
  description: z.string().max(2000).optional(),
  cover_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

type BookForm = z.infer<typeof bookSchema>;

export default function EditBookPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState<Book | null>(null);
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await bookAPI.getBook(bookId);
        setBook(data);
        reset({
          title: data.title,
          author: data.author,
          isbn: data.isbn,
          category: data.category,
          price: data.price,
          published_date: data.published_date,
          description: data.description || "",
          cover_image: data.cover_image || "",
          stock: data.stock,
        });
      } catch {
        toast.error("Failed to load book");
        router.push("/books");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId, reset, router]);

  const onSubmit = async (data: BookForm) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...data };
      if (!payload.cover_image) delete payload.cover_image;
      if (!payload.description) delete payload.description;
      await bookAPI.updateBook(bookId, payload as Parameters<typeof bookAPI.updateBook>[1]);
      toast.success("Book updated successfully!");
      router.push(`/books/${bookId}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to update book");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar title="Edit Book" />
        <LoadingSpinner text="Loading book details..." />
      </div>
    );
  }

  const inputClasses =
    "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <div>
      <Navbar
        title="Edit Book"
        subtitle={book?.title || "Update book details"}
      />

      <div className="p-4 md:p-8 max-w-4xl fade-in">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Book Title *
              </label>
              <input {...register("title")} className={inputClasses} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Author *
              </label>
              <input {...register("author")} className={inputClasses} />
              {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                ISBN *
              </label>
              <input {...register("isbn")} className={inputClasses} />
              {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select {...register("category")} className={inputClasses}>
                <option value="">Select category</option>
                {BOOK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Price ($) *
              </label>
              <input type="number" step="0.01" {...register("price")} className={inputClasses} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Published Date *
              </label>
              <input type="date" {...register("published_date")} className={inputClasses} />
              {errors.published_date && <p className="text-red-500 text-xs mt-1">{errors.published_date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Stock Quantity *
              </label>
              <input type="number" {...register("stock")} className={inputClasses} />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Cover Image URL
              </label>
              <input {...register("cover_image")} className={inputClasses} />
              {errors.cover_image && <p className="text-red-500 text-xs mt-1">{errors.cover_image.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea {...register("description")} rows={4} className={`${inputClasses} resize-none`} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Book
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
