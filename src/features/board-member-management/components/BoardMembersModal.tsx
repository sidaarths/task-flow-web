'use client';

import { useState, useEffect } from 'react';
import {
  IconX,
  IconUsers,
  IconUserPlus,
  IconCrown,
  IconTrash,
  IconLoader,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { User, Board } from '@/types';
import { boardApi } from '../api/boardUsers';
import { useAuth } from '@/context/AuthContext';
import UserSearch from '@/components/UserSearch';
import httpClient from '@/config/httpClient';
import { API_ROUTES } from '@/config/apiConfig';
import { isAxiosError } from 'axios';

interface BoardMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  isOwner: boolean;
}

interface MemberWithDetails extends User {
  isCreator: boolean;
  isCurrentUser: boolean;
}

interface InviteResult {
  user: User;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function BoardMembersModal({
  isOpen,
  onClose,
  board,
  isOwner,
}: BoardMembersModalProps) {
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [inviteResults, setInviteResults] = useState<InviteResult[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setFetchError('');
        const details = await boardApi.getBoardMembers(board.members);
        setMembers(
          details.map((m) => ({
            ...m,
            isCreator: m._id === board.createdBy,
            isCurrentUser: currentUser ? m._id === currentUser._id : false,
          }))
        );
      } catch (err) {
        console.error('[BoardMembersModal] Failed to fetch members:', err);
        setFetchError('Failed to load board members');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [isOpen, board.members, board.createdBy, currentUser]);

  const handleRemoveMember = async (userId: string) => {
    if (!isOwner || userId === board.createdBy) return;
    try {
      setRemovingMemberId(userId);
      await boardApi.removeMemberFromBoard(board._id, userId);
      setMembers((prev) => prev.filter((m) => m._id !== userId));
    } catch (err) {
      console.error('[BoardMembersModal] Failed to remove member:', err);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) return;
    setIsInviting(true);
    setInviteResults(selectedUsers.map((u) => ({ user: u, status: 'pending' })));
    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsers[i];
      try {
        await httpClient.post(`${API_ROUTES.BOARDS}/${board._id}/users/${user._id}`);
        setInviteResults((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'success' } : item))
        );
      } catch (err: unknown) {
        let msg = 'Failed to invite user';
        if (isAxiosError(err)) msg = err.response?.data?.message ?? msg;
        else if (err instanceof Error) msg = err.message;
        setInviteResults((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'error', error: msg } : item))
        );
      }
    }
    setIsInviting(false);
    setSelectedUsers([]);
  };

  const handleClose = () => {
    setFetchError('');
    setSelectedUsers([]);
    setInviteResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col rounded-xl border border-gray-200/60 bg-white shadow-2xl dark:border-gray-700/60 dark:bg-gray-800"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200/60 p-6 dark:border-gray-700/60">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <IconUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Board Members
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Dismiss"
            className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Member list — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading members...</span>
            </div>
          ) : fetchError ? (
            <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
              <IconAlertCircle className="mr-2 h-5 w-5" />
              <span>{fetchError}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-700/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {member.email}
                      </span>
                      {member.isCreator && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          <IconCrown className="h-3 w-3" />
                          Owner
                        </span>
                      )}
                      {member.isCurrentUser && !member.isCreator && (
                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  {isOwner && !member.isCreator && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={removingMemberId === member._id}
                      aria-label="Remove member"
                      className="ml-2 shrink-0 rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20"
                    >
                      {removingMemberId === member._id ? (
                        <IconLoader className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconTrash className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No members found
                </p>
              )}
            </div>
          )}
        </div>

        {/* Invite section — owner only, pinned at bottom */}
        {isOwner && (
          <div className="shrink-0 border-t border-gray-200/60 p-6 dark:border-gray-700/60">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Add Members
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <UserSearch
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  excludeUserIds={board.members}
                  placeholder="Search users by email..."
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={selectedUsers.length === 0 || isInviting}
                aria-label="Add selected users"
                className="flex shrink-0 self-start items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isInviting ? (
                  <IconLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <IconUserPlus className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Inline invite results */}
            {inviteResults.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {inviteResults.map((result) => (
                  <div
                    key={result.user._id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/50"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {result.user.email}
                    </span>
                    <span className="ml-2 shrink-0">
                      {result.status === 'pending' && (
                        <IconLoader className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                      {result.status === 'success' && (
                        <IconCheck className="h-4 w-4 text-green-500" />
                      )}
                      {result.status === 'error' && (
                        <IconAlertCircle className="h-4 w-4 text-red-500" title={result.error} />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-gray-200/60 px-6 py-4 dark:border-gray-700/60">
          <button
            onClick={handleClose}
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
