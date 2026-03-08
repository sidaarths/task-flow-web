'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { CreateBoardModal, EditBoardModal, DeleteBoardModal, BoardCard } from '@/features/board';
import { IconAlertTriangle, IconLoader2, IconPlus, IconSearch } from '@tabler/icons-react';
import { useBoards, useCreateBoard, useUpdateBoard, useDeleteBoard } from '@/hooks/useBoards';
import { Button } from '@/components/ui/Button';
import { BlurFade } from '@/components/magicui/blur-fade';
import { DotPattern } from '@/components/magicui/dot-pattern';

export default function HomePage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') || '';
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  const { data: boards = [], isLoading, isError, error, refetch } = useBoards();
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
  const deleteBoard = useDeleteBoard();

  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return boards;
    const q = searchQuery.toLowerCase().trim();
    return boards.filter(
      (b) => b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)
    );
  }, [boards, searchQuery]);

  const handleCreateBoard = async (data: CreateBoardRequest) => {
    await createBoard.mutateAsync(data);
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setIsEditModalOpen(true);
  };

  const handleUpdateBoard = async (boardId: string, data: UpdateBoardRequest) => {
    await updateBoard.mutateAsync({ boardId, data });
  };

  const handleDeleteBoard = (board: Board) => {
    setDeletingBoard(board);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (boardId: string) => {
    await deleteBoard.mutateAsync(boardId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <IconLoader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading your boards…</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <IconAlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                Something went wrong
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {error instanceof Error ? error.message : 'Failed to load boards'}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page header */}
      <BlurFade delay={0}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
              {searchQuery ? `Results for "${searchQuery}"` : 'Your Boards'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? `${filteredBoards.length} board${filteredBoards.length !== 1 ? 's' : ''} found`
                : 'Manage your projects and collaborate with your team'}
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
            <IconPlus className="h-4 w-4" />
            New Board
          </Button>
        </div>
      </BlurFade>

      {/* Empty state — no boards at all */}
      {boards.length === 0 && (
        <BlurFade delay={0.1}>
          <div className="relative flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center dark:border-gray-700 dark:bg-gray-800/50">
            <DotPattern className="text-gray-200 dark:text-gray-700" cr={0.8} />
            <div className="relative z-10 flex flex-col items-center gap-4 p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <svg
                  className="h-7 w-7 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                  No boards yet
                </h3>
                <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                  Create your first board to start organizing your projects and tasks
                </p>
              </div>
              <Button size="lg" onClick={() => setIsCreateModalOpen(true)}>
                <IconPlus className="h-4 w-4" />
                Create Your First Board
              </Button>
            </div>
          </div>
        </BlurFade>
      )}

      {/* Empty search results */}
      {boards.length > 0 && filteredBoards.length === 0 && searchQuery && (
        <BlurFade delay={0.1}>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <IconSearch className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              No boards found
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              No boards match &quot;{searchQuery}&quot;.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => router.replace('/home')}>
                Clear Search
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <IconPlus className="h-4 w-4" />
                Create Board
              </Button>
            </div>
          </div>
        </BlurFade>
      )}

      {/* Boards grid with staggered BlurFade */}
      {filteredBoards.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBoards.map((board, i) => (
            <BlurFade key={board._id} delay={i * 0.05} inView>
              <BoardCard
                board={board}
                onEdit={handleEditBoard}
                onDelete={handleDeleteBoard}
                currentUserId={currentUser?._id}
              />
            </BlurFade>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBoard}
      />
      <EditBoardModal
        isOpen={isEditModalOpen}
        board={editingBoard}
        onClose={() => { setIsEditModalOpen(false); setEditingBoard(null); }}
        onUpdate={handleUpdateBoard}
      />
      <DeleteBoardModal
        isOpen={isDeleteModalOpen}
        board={deletingBoard}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingBoard(null); }}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
