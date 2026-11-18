// The components with behaviour: Tabs and Dialog. They do in React what nava-ui.js does for
// plain HTML, so a React page does not need the script for them. The Tabs root has no `nv-tabs`
// class on purpose: nava-ui.js listens to `.nv-tabs [role="tab"]`, and both handling the same
// keys would move the selection twice. The kit's CSS styles the list, the tabs and the panels,
// not the root, so the look is the same.

import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx } from './simple.js';

export type TabItem = { id: string; label: ReactNode; content: ReactNode };

export type TabsProps = {
  /** The name of the tab list, read by screen readers. */
  label: string;
  items: TabItem[];
  /** The selected tab's id; the component is controlled. */
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

/** The ARIA tab pattern, automatic activation: the arrows move and select, wrapping at the
 *  ends; Home and End go to the first and the last; one tab is in the tab order. */
export function Tabs({ label, items, value, onChange, className }: TabsProps) {
  const base = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = (next + items.length) % items.length;
    onChange(items[target].id);
    refs.current[target]?.focus();
  }

  return (
    <div className={className}>
      <div className="nv-tabs__list" role="tablist" aria-label={label}>
        {items.map((item, i) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="nv-tabs__tab"
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.id)}
              onKeyDown={(event) => onKeyDown(event, i)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="nv-tabs__panel"
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          tabIndex={0}
          hidden={item.id !== value}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

export type DialogProps = {
  open: boolean;
  /** Called when the dialog closes by itself: Escape, the close button, a click outside. */
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  /** The buttons at the foot, the main one last. */
  actions?: ReactNode;
  /** Close on a click outside the box (closedby="any"). */
  dismissible?: boolean;
  className?: string;
};

/** The native <dialog>, opened with showModal(): focus, Escape and the inert page come from the
 *  browser, and the focus goes back to what opened it. */
export function Dialog({ open, onClose, title, children, actions, dismissible = true, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx('nv-dialog', className)}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog element itself, outside its box, is a click on the backdrop.
        if (!dismissible || event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
        if (outside) event.currentTarget.close();
      }}
    >
      <div className="nv-dialog__header">
        <h2 className="nv-dialog__title" id={titleId}>{title}</h2>
        <button className="nv-dialog__close" type="button" aria-label="Close" onClick={() => ref.current?.close()}>
          ×
        </button>
      </div>
      {children && <div className="nv-dialog__body">{children}</div>}
      {actions && <div className="nv-dialog__actions">{actions}</div>}
    </dialog>
  );
}
