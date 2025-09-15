import BoardPage from '@/features/board';
import { BoardProvider } from '@/context/BoardContext';

export default function Board() {
  return (
    <BoardProvider>
      <BoardPage />
    </BoardProvider>
  );
}
