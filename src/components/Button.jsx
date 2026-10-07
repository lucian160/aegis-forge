export default function Button({ children, variant = 'secondary', icon, className = '', type = 'button', ...props }) {
  return (
    <button className={`button ${variant === 'primary' ? 'primary' : ''} ${className}`.trim()} type={type} {...props}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </button>
  );
}

function Icon({ name }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14"/>,
  };

  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8">
      {paths[name]}
    </svg>
  );
}
