import { PenLine, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreatePostTrigger() {
  const { openCreateModal } = useAuth();
  return <button className="composer-trigger" onClick={openCreateModal}><span className="composer-icon"><PenLine size={20} /></span><span><strong>What are you curious about?</strong><small>Share an idea, ask a question, start a conversation.</small></span><ArrowUpRight size={20} /></button>;
}
