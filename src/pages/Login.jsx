import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResendMessage('');
    setEmailNotVerified(false);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (authError) {
      setEmailNotVerified(authError.code === 'EMAIL_NOT_VERIFIED');
      setError(authError.code === 'EMAIL_NOT_VERIFIED'
        ? 'Please verify your email address before signing in.'
        : authError.message || 'Sign in could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    setResendMessage('');
    try {
      const result = await authService.resendVerification(email);
      setResendMessage(result.message);
    } catch {
      setResendMessage('We could not process that request right now. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;
    if (Number.isInteger(historyIndex) && historyIndex > 0) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  return (
    <div className="auth-form-card">
      <button className="button auth-back-button" type="button" onClick={handleBack}>Back</button>
      <p className="eyebrow">Welcome back</p>
      <h2>Sign in to AEGIS FORGE</h2>
      <p className="auth-form-intro">Sign in with your organization work email to continue to your workspace.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Work email
          <input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {emailNotVerified && <button className="auth-link-button" type="button" onClick={resendVerification} disabled={resending || !email}>{resending ? 'Sending…' : 'Resend verification email'}</button>}
        {resendMessage && <p className="auth-success" role="status">{resendMessage}</p>}
        <Button className="auth-submit" variant="primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="auth-footer">Don&apos;t have an account? <Link to="/register">Register</Link> · <Link to="/reset-password">Forgot password?</Link></p>
      <p className="auth-footer">Secure access is provided by the AEGIS Forge API.</p>
    </div>
  );
}
