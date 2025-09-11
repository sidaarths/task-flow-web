'use client';

import { useState, useEffect } from 'react';
import { IconX, IconUsers, IconCrown, IconTrash, IconLoader, IconAlertCircle } from '@tabler/icons-react';
import { User, Board } from '@/types';
import { boardApi } from '../api/board';
import { useAuth } from '@/context/AuthContext';

interface BoardMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  onMemberRemoved?: (removedUserId: string) => void;
}

interface MemberWithDetails extends User {
  isCreator: boolean;
  isCurrentUser: boolean;
}

export default function BoardMembersModal({
  isOpen,
  onClose,
  board,
  onMemberRemoved
}: BoardMembersModalProps) {
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const isOwner = currentUser && board.createdBy === currentUser._id;

  useEffect(() => {
    const fetchMembers = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Get member details using the proper API
        const memberDetails = await boardApi.getBoardMembers(board.members);
        
        // Add additional flags for each member
        const membersWithDetails: MemberWithDetails[] = memberDetails.map(member => ({
          ...member,
          isCreator: member._id === board.createdBy,
          isCurrentUser: currentUser ? member._id === currentUser._id : false
        }));
        
        setMembers(membersWithDetails);
      } catch (error) {
        console.error('Failed to fetch board members:', error);
        setError('Failed to load board members');
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
      
      // Update local state
      setMembers(prev => prev.filter(member => member._id !== userId));
      
      if (onMemberRemoved) {
        onMemberRemoved(userId);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200/60 dark:border-gray-700/60">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Board Members
              </h2>
              <p className="text-sm text-gray-600/80 dark:text-gray-400/80">
                {members.length} member{members.length !== 1 ? 's' : ''}
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading members...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
              <IconAlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.email}
                        </span>
                        {member.isCreator && (
                          <div className="flex items-center space-x-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs">
                            <IconCrown className="w-3 h-3" />
                            <span>Owner</span>
                          </div>
                        )}
                        {member.isCurrentUser && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {member._id}
                      </div>
                    </div>
                  </div>

                  {/* Remove button - only shown for owner and not for creator */}
                  {isOwner && !member.isCreator && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={removingMemberId === member._id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove member"
                    >
                      {removingMemberId === member._id ? (
                        <IconLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <IconTrash className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No members found
                </div>
              )}
            </div>
          )}

          {/* Info message for non-owners */}
          {!isOwner && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Only the board owner can manage members.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200/60 dark:border-gray-700/60">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:shadow-md transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
