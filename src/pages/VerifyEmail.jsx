import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, message: '', success: false });
  const processedLink = useRef(false);
  const verificationRequest = useRef(null);
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (!token) {
      if (!processedLink.current) setState({ loading: false, success: false, message: 'This verification link is missing or invalid.' });
      return () => { active = false; };
    }
    verificationRequest.current ??= authService.verifyEmail(token);
    verificationRequest.current
      .then((result) => {
        if (!active) return;
        processedLink.current = true;
        setState({ loading: false, success: true, message: result.message });
        navigate('/verify-email?result=success', { replace: true });
      })
      .catch((error) => {
        if (!active) return;
        processedLink.current = true;
        setState({ loading: false, success: false, message: error.message || 'This verification link is invalid or has expired.' });
        navigate('/verify-email?result=invalid', { replace: true });
      });
    return () => { active = false; };
  }, [token]);

  return (
    <div className="auth-form-card">
      <p className="eyebrow">Email verification</p>
      <h2>{state.loading ? 'Verifying your email…' : state.success ? 'Email verified' : 'Verification needed'}</h2>
      <p className={state.success ? 'auth-success' : state.loading ? 'auth-form-intro' : 'auth-error'} role={state.loading ? undefined : 'status'}>{state.message || 'Please wait while we check your verification link.'}</p>
      {!state.loading && <Link className="auth-link" to="/login">Continue to sign in</Link>}
    </div>
  );
}