"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { bookAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Book } from "@/lib/types";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  DollarSign,
  Edit,
  Hash,
  Layers,
  Package,
  Trash2,
  User,
} from "lucide-react";

export default function BookDetailsPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const bookId = params.id as string;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await bookAPI.getBook(bookId);
        setBook(data);
      } catch {
        toast.error("Book not found");
        router.push("/books");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone."))
      return;
    setIsDeleting(true);
    try {
      await bookAPI.deleteBook(bookId);
      toast.success("Book deleted successfully");
      router.push("/books");
    } catch {
      toast.error("Failed to delete book");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar title="Book Details" />
        <LoadingSpinner text="Loading book details..." />
      </div>
    );
  }

  if (!book) return null;

  const canModify = user?.role === "admin" || book.created_by === user?.id;

  const detailItems = [
    { icon: User, label: "Author", value: book.author },
    { icon: Hash, label: "ISBN", value: book.isbn },
    { icon: Layers, label: "Category", value: book.category },
    {
      icon: DollarSign,
      label: "Price",
      value: `$${book.price?.toFixed(2)}`,
    },
    {
      icon: Calendar,
      label: "Published",
      value: book.published_date
        ? new Date(book.published_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
    },
    {
      icon: Package,
      label: "Stock",
      value: `${book.stock} copies`,
    },
  ];

  return (
    <div>
      <Navbar title="Book Details" subtitle={book.title} />

      <div className="p-4 md:p-8 max-w-5xl fade-in">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Books
          </button>

          {canModify && (
            <div className="flex items-center gap-2">
              <Link
                href={`/books/edit/${book._id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors border border-amber-200 dark:border-amber-500/20"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 aspect-[3/4] flex items-center justify-center border border-slate-200 dark:border-slate-800">
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-3">
                    No cover image
                  </p>
                </div>
              )}
            </div>

            {/* Stock status */}
            <div
              className={`mt-4 p-4 rounded-xl text-center font-medium ${
                book.stock > 0
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                  : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"
              }`}
            >
              {book.stock > 0
                ? `✓ ${book.stock} copies in stock`
                : "✗ Currently out of stock"}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & price */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {book.title}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">by {book.author}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${book.price?.toFixed(2)}
                  </div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                    {book.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {detailItems.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {book.description && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </p>
              </div>
            )}

            {/* Meta */}
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Added on{" "}
              {new Date(book.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
