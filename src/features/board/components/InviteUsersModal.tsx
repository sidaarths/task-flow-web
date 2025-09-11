'use client';

import { useState } from 'react';
import {
  IconX,
  IconUserPlus,
  IconCheck,
  IconAlertCircle,
  IconLoader,
  IconRefresh,
} from '@tabler/icons-react';
import { User } from '@/types';
import UserSearch from '@/components/UserSearch';
import httpClient from '@/config/httpClient';
import { API_ROUTES } from '@/config/apiConfig';
import { isAxiosError } from 'axios';

interface InviteUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  existingMemberIds: string[];
  onMembersAdded?: (newMemberIds: string[]) => void;
}

interface InviteResult {
  user: User;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function InviteUsersModal({
  isOpen,
  onClose,
  boardId,
  existingMemberIds,
  onMembersAdded,
}: InviteUsersModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [inviteResults, setInviteResults] = useState<InviteResult[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleClose = () => {
    setSelectedUsers([]);
    setInviteResults([]);
    setShowResults(false);
    setIsInviting(false);
    onClose();
  };

  const inviteUserToBoard = async (
    user: User
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await httpClient.post(
        `${API_ROUTES.BOARDS}/${boardId}/users/${user._id}`
      );
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'Failed to invite user';
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    setIsInviting(true);
    setShowResults(true);

    const initialResults: InviteResult[] = selectedUsers.map((user) => ({
      user,
      status: 'pending',
    }));
    setInviteResults(initialResults);

    const results: InviteResult[] = [];

    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsers[i];
      const result = await inviteUserToBoard(user);

      const inviteResult: InviteResult = {
        user,
        status: result.success ? 'success' : 'error',
        error: result.error,
      };

      results.push(inviteResult);

      setInviteResults((prev) =>
        prev.map((item, index) => (index === i ? inviteResult : item))
      );
    }

    setIsInviting(false);

    // Call onMembersAdded with successful user IDs
    const successfulUserIds = results
      .filter((result) => result.status === 'success')
      .map((result) => result.user._id);

    if (successfulUserIds.length > 0 && onMembersAdded) {
      onMembersAdded(successfulUserIds);
    }
  };

  const handleRetryFailedInvites = async () => {
    const failedResults = inviteResults.filter(
      (result) => result.status === 'error'
    );
    if (failedResults.length === 0) return;

    setIsInviting(true);

    // Set failed invites back to pending
    setInviteResults((prev) =>
      prev.map((result) =>
        result.status === 'error' ? { ...result, status: 'pending' } : result
      )
    );

    // Retry failed invites
    for (const failedResult of failedResults) {
      const result = await inviteUserToBoard(failedResult.user);

      setInviteResults((prev) =>
        prev.map((item) =>
          item.user._id === failedResult.user._id
            ? {
                ...item,
                status: result.success ? 'success' : 'error',
                error: result.error,
              }
            : item
        )
      );
    }

    setIsInviting(false);

    // Get current state after all retries are complete
    const currentResults = inviteResults.map((item) => {
      const failedItem = failedResults.find(
        (f) => f.user._id === item.user._id
      );
      return failedItem ? item : item;
    });

    // Call onMembersAdded with successful user IDs
    const successfulUserIds = currentResults
      .filter((result) => result.status === 'success')
      .map((result) => result.user._id);

    if (successfulUserIds.length > 0 && onMembersAdded) {
      onMembersAdded(successfulUserIds);
    }
  };

  const getStatusIcon = (status: InviteResult['status']) => {
    switch (status) {
      case 'pending':
        return <IconLoader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <IconCheck className="w-4 h-4 text-green-500" />;
      case 'error':
        return <IconAlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: InviteResult['status']) => {
    switch (status) {
      case 'pending':
        return 'Inviting...';
      case 'success':
        return 'Invited successfully';
      case 'error':
        return 'Failed to invite';
    }
  };

  const hasFailedInvites = inviteResults.some(
    (result) => result.status === 'error'
  );
  const allCompleted = inviteResults.length > 0 && !isInviting;
  const successCount = inviteResults.filter(
    (result) => result.status === 'success'
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200/60 dark:border-gray-700/60">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconUserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Invite Users to Board
              </h2>
              <p className="text-sm text-gray-600/80 dark:text-gray-400/80">
                Search and invite users to collaborate
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showResults ? (
            <>
              {/* User Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Users
                </label>
                <UserSearch
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  excludeUserIds={existingMemberIds}
                  placeholder="Search users by email..."
                />
              </div>

              {/* Selected Count */}
              {selectedUsers.length > 0 && (
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>{selectedUsers.length}</strong> user
                    {selectedUsers.length !== 1 ? 's' : ''} selected for
                    invitation
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUsers}
                  disabled={selectedUsers.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                >
                  <IconUserPlus className="w-4 h-4" />
                  <span>
                    Invite {selectedUsers.length} User
                    {selectedUsers.length !== 1 ? 's' : ''}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Invite Results */}
              <div className="space-y-3 mb-6">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Invitation Results
                </div>

                {inviteResults.map((result) => (
                  <div
                    key={result.user._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.user.email}
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {result.error}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getStatusText(result.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {allCompleted && (
                <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <strong>{successCount}</strong> out of{' '}
                    <strong>{inviteResults.length}</strong> users invited
                    successfully
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                {hasFailedInvites && allCompleted && (
                  <button
                    onClick={handleRetryFailedInvites}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                  >
                    <IconRefresh className="w-4 h-4" />
                    <span>Retry Failed</span>
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:shadow-md transition-all duration-200"
                >
                  {allCompleted ? 'Done' : 'Close'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
