import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { authService } from '../services/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const completedFromUrl = searchParams.get('complete') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await authService.resetPassword(email);
      setMessage(result.message || 'If an account exists for that email, password reset instructions will be sent.');
    } catch {
      setMessage('If an account exists for that email, password reset instructions will be sent.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await authService.completePasswordReset(token, password);
      setMessage(result.message);
      setResetComplete(true);
      setPassword('');
      setConfirmation('');
      navigate('/reset-password?complete=1', { replace: true });
    } catch (requestError) {
      setError(requestError.status === 400
        ? requestError.message
        : 'We could not reset your password. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-card">
      <p className="eyebrow">Account recovery</p>
      <h2>{token ? 'Choose a new password' : 'Reset your password'}</h2>
      <p className="auth-form-intro">{token ? 'Choose a new password for your account.' : 'Enter your work email. If an account exists, we will send reset instructions.'}</p>
      {resetComplete || completedFromUrl ? <p className="auth-success" role="status">{message || 'Your password has been updated. Sign in with your new password.'}</p> : token ? (
        <form className="auth-form" onSubmit={handleResetPassword}>
          <label>New password<input type="password" autoComplete="new-password" minLength={8} maxLength={4096} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} maxLength={4096} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <Button className="auth-submit" variant="primary" type="submit" disabled={submitting}>{submitting ? 'Updating password…' : 'Update password'}</Button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleForgotPassword}>
          <label>Work email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></label>
          {message && <p className="auth-success" role="status">{message}</p>}
          <Button className="auth-submit" variant="primary" type="submit" disabled={submitting}>{submitting ? 'Sending request…' : 'Send reset request'}</Button>
        </form>
      )}
      <Link className="auth-link" to="/login">Return to sign in</Link>
    </div>
  );
}