"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { bookAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import {
  BookOpen,
  TrendingUp,
  Package,
  Users,
  ArrowRight,
  BarChart3,
  Clock,
} from "lucide-react";

interface DashboardStats {
  totalBooks: number;
  totalCategories: number;
  totalStock: number;
  recentBooks: Array<{
    _id: string;
    title: string;
    author: string;
    category: string;
    price: number;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all books to compute stats
        const response = await bookAPI.getBooks({ limit: 100 });
        const books = response.books || [];

        const categories = new Set(books.map((b: { category: string }) => b.category));
        const totalStock = books.reduce(
          (sum: number, b: { stock: number }) => sum + (b.stock || 0),
          0
        );

        setStats({
          totalBooks: response.total || 0,
          totalCategories: categories.size,
          totalStock,
          recentBooks: books.slice(0, 5),
        });
      } catch {
        setStats({
          totalBooks: 0,
          totalCategories: 0,
          totalStock: 0,
          recentBooks: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div>
        <Navbar title="Dashboard" subtitle="Welcome back!" />
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Books",
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      gradient: "from-indigo-500 to-purple-600",
      shadow: "shadow-indigo-500/20",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      label: "Categories",
      value: stats?.totalCategories || 0,
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: "Total Stock",
      value: stats?.totalStock || 0,
      icon: Package,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "Your Role",
      value: user?.role === "admin" ? "Admin" : "User",
      icon: Users,
      gradient: "from-pink-500 to-rose-600",
      shadow: "shadow-pink-500/20",
      bg: "bg-pink-50 dark:bg-pink-500/10",
    },
  ];

  return (
    <div>
      <Navbar
        title="Dashboard"
        subtitle={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${user?.name}!`}
      />

      <div className="p-4 md:p-8 space-y-8 fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((card, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg ${card.shadow} transition-all duration-300`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>Updated just now</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions + Recent Books */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/books/add"
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Add New Book
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Add a book to your library
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/books"
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-100 dark:border-emerald-500/20 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Browse Library
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      View all books
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Recent Books */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Books
              </h3>
              <Link
                href="/books"
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                View all
              </Link>
            </div>
            {stats?.recentBooks && stats.recentBooks.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBooks.map((book) => (
                  <Link
                    key={book._id}
                    href={`/books/${book._id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {book.author} • {book.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        ${book.price?.toFixed(2)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No books yet. Start by adding your first book!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
