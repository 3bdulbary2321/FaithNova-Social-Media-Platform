import { useAuth } from '../context/AuthContext';
import Dialog from './Dialog';
import AuthForm from './AuthForm';

export default function AuthDialog() {
  const { isAuthDialogOpen, closeAuthDialog } = useAuth();
  return <Dialog open={isAuthDialogOpen} onClose={closeAuthDialog} title="Join the conversation" description="Sign in or create an account to comment, react, save posts, and share your ideas.">
    {isAuthDialogOpen && <AuthForm onSuccess={closeAuthDialog} />}
  </Dialog>;
}
