// Form controls. Field ties a label, a control and a hint or an error together with ids it
// makes itself (useId), so the control is always named and described; a control outside a
// Field takes its own aria-* like any input.

import { cloneElement, forwardRef, isValidElement, useId } from 'react';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { cx } from './simple.js';

export type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  /** An error message: the control becomes aria-invalid and points at it. */
  error?: ReactNode;
  /** One control: Input, Select, Textarea or a native one. */
  children: ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
  className?: string;
};

export function Field({ label, hint, error, children, className }: FieldProps) {
  const base = useId();
  const id = children.props.id ?? `${base}-control`;
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [children.props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : children.props['aria-invalid'] })
    : children;
  return (
    <div className={cx('nv-field', className)}>
      <label className="nv-label" htmlFor={id}>{label}</label>
      {control}
      {hint && <p className="nv-hint" id={hintId}>{hint}</p>}
      {error && <p className="nv-error" id={errorId}>{error}</p>}
    </div>
  );
}

export type InputProps = ComponentPropsWithoutRef<'input'> & {
  /** Box corners, as the other form controls; the default is the pill of a search field. */
  box?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ box = false, className, ...rest }, ref) {
  return <input ref={ref} className={cx('nv-input', box && 'nv-input--box', className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<'textarea'>>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cx('nv-textarea', className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<'select'>>(function Select(
  { className, ...rest },
  ref,
) {
  return <select ref={ref} className={cx('nv-select', className)} {...rest} />;
});

export type ChoiceProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  /** A switch applies at once; a checkbox is sent with the form. */
  control?: 'checkbox' | 'radio' | 'switch';
  label: ReactNode;
};

/** A checkbox, radio or switch inside its label, so the text is part of the target. */
export const Choice = forwardRef<HTMLInputElement, ChoiceProps>(function Choice(
  { control = 'checkbox', label, className, ...rest },
  ref,
) {
  const type = control === 'radio' ? 'radio' : 'checkbox';
  return (
    <label className={cx('nv-choice', className)}>
      <input
        ref={ref}
        className={`nv-${control}`}
        type={type}
        role={control === 'switch' ? 'switch' : undefined}
        {...rest}
      />{' '}
      {label}
    </label>
  );
});

export function Fieldset({ legend, className, children, ...rest }: ComponentPropsWithoutRef<'fieldset'> & { legend: ReactNode }) {
  return (
    <fieldset className={cx('nv-fieldset', className)} {...rest}>
      <legend className="nv-legend">{legend}</legend>
      {children}
    </fieldset>
  );
}
