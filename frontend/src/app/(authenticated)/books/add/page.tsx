"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { bookAPI } from "@/lib/api";
import { BOOK_CATEGORIES } from "@/lib/types";
import Navbar from "@/components/Navbar";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  author: z.string().min(1, "Author is required").max(200),
  isbn: z
    .string()
    .min(10, "ISBN must be at least 10 characters")
    .max(17, "ISBN must be at most 17 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  published_date: z.string().min(1, "Published date is required"),
  description: z.string().max(2000).optional(),
  cover_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

type BookForm = z.infer<typeof bookSchema>;

export default function AddBookPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      stock: 0,
    },
  });

  const onSubmit = async (data: BookForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        cover_image: data.cover_image || undefined,
        description: data.description || undefined,
      };
      await bookAPI.createBook(payload as Parameters<typeof bookAPI.createBook>[0]);
      toast.success("Book added successfully!");
      router.push("/books");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to add book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <div>
      <Navbar title="Add New Book" subtitle="Fill in the details to add a book to your library" />

      <div className="p-4 md:p-8 max-w-4xl fade-in">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Books
        </button>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Book Title *
              </label>
              <input {...register("title")} className={inputClasses} placeholder="Enter book title" />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Author *
              </label>
              <input {...register("author")} className={inputClasses} placeholder="Author name" />
              {errors.author && (
                <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>
              )}
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                ISBN *
              </label>
              <input
                {...register("isbn")}
                className={inputClasses}
                placeholder="978-3-16-148410-0"
              />
              {errors.isbn && (
                <p className="text-red-500 text-xs mt-1">{errors.isbn.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select {...register("category")} className={inputClasses}>
                <option value="">Select category</option>
                {BOOK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price")}
                className={inputClasses}
                placeholder="29.99"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>

            {/* Published Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Published Date *
              </label>
              <input type="date" {...register("published_date")} className={inputClasses} />
              {errors.published_date && (
                <p className="text-red-500 text-xs mt-1">{errors.published_date.message}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                {...register("stock")}
                className={inputClasses}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
              )}
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Cover Image URL
              </label>
              <input
                {...register("cover_image")}
                className={inputClasses}
                placeholder="https://example.com/cover.jpg"
              />
              {errors.cover_image && (
                <p className="text-red-500 text-xs mt-1">{errors.cover_image.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Brief description of the book..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Add Book
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
