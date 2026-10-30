import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { Truck } from 'lucide-react';
import { SHIPPING_FIELDS, ShippingDetails, ShippingErrors, ShippingField, validateShipping } from '../../orders';

interface ShippingFormProps {
  value: ShippingDetails;
  onChange: Dispatch<SetStateAction<ShippingDetails>>;
  onSubmit: () => void;
}

const inputClass = (invalid: boolean) =>
  `w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 outline-none transition-colors focus-visible:border-black ${
    invalid ? 'border-red-300 bg-red-50/40' : 'border-transparent'
  }`;

export function ShippingForm({ value, onChange, onSubmit }: ShippingFormProps) {
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Functional update so rapid changes (e.g. browser autofill) never overwrite each other.
  const update = (field: ShippingField, fieldValue: string) => onChange(prev => ({ ...prev, [field]: fieldValue }));

  // Once the user has tried to continue, keep errors in sync as they type.
  useEffect(() => {
    if (submitted) setErrors(validateShipping(value));
  }, [submitted, value]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateShipping(value);
    setErrors(nextErrors);
    setSubmitted(true);
    const firstInvalid = Object.keys(SHIPPING_FIELDS).find(field => nextErrors[field as ShippingField]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLInputElement>(`#shipping-${firstInvalid}`)?.focus();
      return;
    }
    onSubmit();
  };

  const field = (name: ShippingField, className = '') => {
    const { label, max, autoComplete } = SHIPPING_FIELDS[name];
    const error = errors[name];
    return (
      <div className={`space-y-2 ${className}`}>
        <label htmlFor={`shipping-${name}`} className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
          {label}
        </label>
        <input
          id={`shipping-${name}`}
          name={name}
          type="text"
          autoComplete={autoComplete}
          maxLength={max}
          value={value[name]}
          onChange={e => update(name, e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `shipping-${name}-error` : undefined}
          className={inputClass(Boolean(error))}
        />
        {error && (
          <p id={`shipping-${name}-error`} className="text-xs font-medium text-red-600 ml-1">{error}</p>
        )}
      </div>
    );
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="text-gray-400" size={24} aria-hidden="true" />
        <h2 className="text-xl font-bold">Shipping details</h2>
      </div>
      {field('name')}
      {field('address')}
      <div className="grid sm:grid-cols-3 gap-6">
        {field('city')}
        {field('region')}
        {field('postalCode')}
      </div>
      <button type="submit" className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors">
        Continue to review
      </button>
    </form>
  );
}
