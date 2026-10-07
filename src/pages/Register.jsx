import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { authService } from '../services/auth';
import '../styles/privacyConsent.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await authService.register({ name, email, password, privacyConsent });
      setMessage(result.message || 'Account created. Check your email for a verification link before signing in.');
      setPassword('');
    } catch (requestError) {
      setError(requestError.status === 503
        ? 'Your account may have been created, but we could not send the verification email. Try resending it from sign in later.'
        : requestError.status >= 400 && requestError.status < 500
          ? requestError.message
          : 'We could not create your account. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-card">
      <p className="eyebrow">Join AEGIS FORGE</p>
      <h2>Create your account</h2>
      <p className="auth-form-intro">Verify your email address before signing in.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Full name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} /></label>
        <label>Work email<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></label>
        <label>Password<input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={4096} /></label>
        <label className="privacy-consent"><input type="checkbox" name="privacyConsent" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} required /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and consent to the processing of my information to create and maintain my account.</span></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <Button className="auth-submit" variant="primary" type="submit" disabled={submitting || !privacyConsent}>{submitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <p className="auth-footer"><Link to="/login">Return to sign in</Link></p>
    </div>
  );
}