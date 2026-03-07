'use client';

import { useRouter } from 'next/navigation';
import { IconEdit, IconTrash, IconUsers } from '@tabler/icons-react';
import type { Board } from '@/types';
import { MagicCard } from '@/components/magicui/magic-card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  currentUserId?: string;
}

export default function BoardCard({ board, onEdit, onDelete, currentUserId }: BoardCardProps) {
  const router = useRouter();
  const isOwner = board.createdBy === currentUserId;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <MagicCard
      className={cn(
        'rounded-xl border border-gray-200/60 bg-white shadow-sm',
        'dark:border-gray-700/60 dark:bg-gray-800',
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      <div onClick={() => router.push(`/boards/${board._id}`)} className="p-5">
        {/* Top row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate text-base font-semibold text-gray-900 dark:text-white">
              {board.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {board.description?.trim() || 'No description provided'}
            </p>
          </div>

          {isOwner && (
            <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(board)}
                title="Edit board"
                className="px-2 py-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <IconEdit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(board)}
                title="Delete board"
                className="px-2 py-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-3">
            <span>Created {formatDate(board.createdAt)}</span>
            <span className="flex items-center gap-1">
              <IconUsers className="h-3 w-3" />
              {board.members.length} member{board.members.length !== 1 ? 's' : ''}
            </span>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isOwner
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            )}
          >
            {isOwner ? 'Owner' : 'Member'}
          </span>
        </div>
      </div>
    </MagicCard>
  );
}
