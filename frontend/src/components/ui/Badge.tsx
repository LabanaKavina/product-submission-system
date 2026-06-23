import { HTMLAttributes } from 'react';

type BadgeVariant = 'submitted' | 'approved' | 'rejected' | 'default' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  label: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  submitted: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  approved:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected:  'bg-red-50 text-red-700 ring-1 ring-red-200',
  default:   'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  info:      'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  submitted: 'bg-amber-400',
  approved:  'bg-emerald-500',
  rejected:  'bg-red-500',
  default:   'bg-gray-400',
  info:      'bg-teal-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

export default function Badge({
  variant = 'default',
  size = 'sm',
  label,
  dot = true,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`inline-block rounded-full ${dotClasses[variant]} ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      )}
      {label}
    </span>
  );
}
