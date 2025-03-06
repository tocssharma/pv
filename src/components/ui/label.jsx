export const Label = ({ htmlFor, children, className = "" }) => {
    return (
      <label
        htmlFor={htmlFor}
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      >
        {children}
      </label>
    );
  };
  