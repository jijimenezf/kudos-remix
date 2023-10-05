import { useState, useEffect } from "react";

interface FormFieldProps {
  htmlFor: string;
  label: string;
  type?: string;
  value: string | number | readonly string[] | undefined;
  onChange?: (...args: any) => void;
  error?: string;
}

export function FormField({ 
  htmlFor,
  label,
  type="string",
  value,
  onChange=()=>{},
  error="" }: FormFieldProps) {
  const [errorText, setErrorText] = useState(error);

  useEffect(() => {
    setErrorText(error);
  }, [error]);

  return (
    <>
      <label htmlFor={htmlFor} className="text-blue-600 font-semibold">
        {label}
      </label>
      <input
        type={type}
        id={htmlFor}
        name={htmlFor}
        className="w-full p-2 rounded-xl my-2"
        value={value}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          onChange(e);
          setErrorText('');
        }}
      />
      <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">
        { errorText || ''}
      </div>
    </>
  )
}