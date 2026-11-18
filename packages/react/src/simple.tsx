// The stateless components: each renders the kit's markup with its classes, passes every other
// prop to the element, and merges a className given by the caller. No styles live here: the
// look is nava-ui's CSS (dist/nava-ui.css), which the page loads.

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// --- Button ---------------------------------------------------------------------

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'default' | 'primary';
  /** Working: keeps the label, adds the spinner and aria-busy, and ignores clicks. */
  busy?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', busy = false, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('nv-button', variant === 'primary' && 'nv-button--primary', className)}
      aria-busy={busy || undefined}
      {...rest}
    >
      {busy && <span className="nv-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});

// --- Badge, Tag, Pill -------------------------------------------------------------

export type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  tone?: 'neutral' | 'accent' | 'warning' | 'danger';
  dot?: boolean;
};

export function Badge({ tone = 'neutral', dot = false, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cx('nv-badge', tone !== 'neutral' && `nv-badge--${tone}`, dot && 'nv-badge--dot', className)}
      {...rest}
    />
  );
}

export type PillProps = ComponentPropsWithoutRef<'span'> & {
  /** The kind, told by the mark's shape and the border, never by colour alone. */
  kind?: 'plain' | 'accent' | 'dashed';
  mark?: 'ring' | 'dot' | 'diamond' | 'none';
  /** Words for screen readers after the label, e.g. ", at work". */
  srText?: string;
};

export function Pill({ kind = 'plain', mark = 'ring', srText, className, children, ...rest }: PillProps) {
  return (
    <span className={cx('nv-pill', kind !== 'plain' && `nv-pill--${kind}`, className)} {...rest}>
      {mark !== 'none' && (
        <span className={cx('nv-mark', mark !== 'ring' && `nv-mark--${mark}`)} aria-hidden="true" />
      )}
      {children}
      {srText && <span className="nv-sr-only">{srText}</span>}
    </span>
  );
}

// --- Alert ------------------------------------------------------------------------

const MARKS = { info: 'i', success: '✓', warning: '!', danger: '×' } as const;

export type AlertProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  tone?: keyof typeof MARKS;
  title?: ReactNode;
  /** Shows a close button; the caller removes the alert. */
  onDismiss?: () => void;
};

export function Alert({ tone = 'info', title, onDismiss, className, children, ...rest }: AlertProps) {
  return (
    <div className={cx('nv-alert', tone !== 'info' && `nv-alert--${tone}`, className)} {...rest}>
      <span className="nv-alert__icon" aria-hidden="true">{MARKS[tone]}</span>
      <div className="nv-alert__body">
        {title && <p className="nv-alert__title">{title}</p>}
        {children && <p className="nv-alert__text">{children}</p>}
      </div>
      {onDismiss && (
        <button className="nv-alert__close" type="button" aria-label="Dismiss" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}

// --- Empty state, skeleton, spinner -----------------------------------------------

export type EmptyStateProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  icon?: ReactNode;
  title: ReactNode;
  /** The one action, usually a Button. */
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4;
};

export function EmptyState({ icon, title, action, headingLevel = 2, className, children, ...rest }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as 'h2';
  return (
    <div className={cx('nv-empty', className)} {...rest}>
      {icon && <span className="nv-empty__icon" aria-hidden="true">{icon}</span>}
      <Heading className="nv-empty__title">{title}</Heading>
      {children && <p className="nv-empty__text">{children}</p>}
      {action && <div className="nv-actions">{action}</div>}
    </div>
  );
}

export type SkeletonProps = ComponentPropsWithoutRef<'span'> & { shape?: 'block' | 'line' | 'circle' };

/** Decoration: hidden from screen readers. Mark the loading region aria-busy yourself. */
export function Skeleton({ shape = 'block', className, ...rest }: SkeletonProps) {
  return (
    <span
      className={cx('nv-skeleton', shape !== 'block' && `nv-skeleton--${shape}`, className)}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function Spinner({ className, ...rest }: ComponentPropsWithoutRef<'span'>) {
  return <span className={cx('nv-spinner', className)} aria-hidden="true" {...rest} />;
}

// --- Bento grid ------------------------------------------------------------------

export function Bento({ className, ...rest }: ComponentPropsWithoutRef<'ul'>) {
  return <ul className={cx('nv-bento', className)} {...rest} />;
}

export type TileProps = Omit<ComponentPropsWithoutRef<'li'>, 'title'> & {
  title?: ReactNode;
  count?: ReactNode;
  width?: 2 | 3 | 4 | 6;
  tall?: boolean;
  feature?: boolean;
};

export function Tile({ title, count, width = 2, tall = false, feature = false, className, children, ...rest }: TileProps) {
  return (
    <li
      className={cx('nv-tile', feature && 'nv-tile--feature', width !== 2 && `nv-tile--w${width}`, tall && 'nv-tile--h2', className)}
      {...rest}
    >
      {title && (
        <h3 className="nv-tile__title">
          {title}
          {count !== undefined && <span className="nv-tile__count">{count}</span>}
        </h3>
      )}
      {children}
    </li>
  );
}

// --- Data table -------------------------------------------------------------------

export type DataTableProps = ComponentPropsWithoutRef<'table'> & {
  /** The name of the scrolling box, read by screen readers. */
  label: string;
  /** A max-height for the box, so the header sticks while the rows scroll. */
  maxHeight?: string;
};

/** The box takes the keyboard focus, so a keyboard can scroll it. */
export function DataTable({ label, maxHeight, className, ...rest }: DataTableProps) {
  return (
    <div className="nv-table-wrap" tabIndex={0} role="region" aria-label={label} style={maxHeight ? { maxHeight } : undefined}>
      <table className={cx('nv-table', className)} {...rest} />
    </div>
  );
}
