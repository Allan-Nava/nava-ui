// The wrappers render the kit's markup: the classes, the ARIA and the ids the CSS and screen
// readers rely on. Rendered with React's own server renderer, from the built dist/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup as html } from 'react-dom/server';
import {
  Button, Badge, Pill, Alert, EmptyState, Skeleton, Bento, Tile, DataTable,
  Field, Input, Select, Choice, Fieldset, Tabs, Dialog,
} from '../dist/index.js';

test('Button: variant, busy, type, className merged', () => {
  assert.equal(html(h(Button, null, 'Save')), '<button type="button" class="nv-button">Save</button>');
  const out = html(h(Button, { variant: 'primary', busy: true, className: 'x' }, 'Saving'));
  assert.match(out, /class="nv-button nv-button--primary x"/);
  assert.match(out, /aria-busy="true"/);
  assert.match(out, /<span class="nv-spinner" aria-hidden="true"><\/span>Saving/);
});

test('Badge and Pill: tone, dot, kind, mark and the words for screen readers', () => {
  assert.equal(html(h(Badge, { tone: 'danger', dot: true }, 'Down')), '<span class="nv-badge nv-badge--danger nv-badge--dot">Down</span>');
  const pill = html(h(Pill, { kind: 'dashed', mark: 'diamond', srText: ', own project' }, 'Rust'));
  assert.equal(pill, '<span class="nv-pill nv-pill--dashed"><span class="nv-mark nv-mark--diamond" aria-hidden="true"></span>Rust<span class="nv-sr-only">, own project</span></span>');
});

test('Alert: tone, title, text, and a close button only with onDismiss', () => {
  const out = html(h(Alert, { tone: 'warning', title: 'Degraded' }, 'One region is slow.'));
  assert.match(out, /^<div class="nv-alert nv-alert--warning">/);
  assert.match(out, /<p class="nv-alert__title">Degraded<\/p>/);
  assert.doesNotMatch(out, /nv-alert__close/);
  assert.match(html(h(Alert, { onDismiss() {} }, 'x')), /<button class="nv-alert__close" type="button" aria-label="Dismiss">/);
});

test('EmptyState, Skeleton, Tile and Bento', () => {
  const empty = html(h(EmptyState, { title: 'Nothing yet', headingLevel: 3, action: h(Button, null, 'Add') }, 'Text'));
  assert.match(empty, /<h3 class="nv-empty__title">Nothing yet<\/h3>/);
  assert.match(empty, /<div class="nv-actions"><button/);
  assert.equal(html(h(Skeleton, { shape: 'line' })), '<span class="nv-skeleton nv-skeleton--line" aria-hidden="true"></span>');
  const tile = html(h(Bento, null, h(Tile, { title: 'Go', count: 3, width: 3, tall: true, feature: true })));
  assert.match(tile, /<ul class="nv-bento"><li class="nv-tile nv-tile--feature nv-tile--w3 nv-tile--h2">/);
  assert.match(tile, /<span class="nv-tile__count">3<\/span>/);
});

test('DataTable: a focusable, named region around the table', () => {
  const out = html(h(DataTable, { label: 'Regions', maxHeight: '20rem' }, h('tbody')));
  assert.equal(out, '<div class="nv-table-wrap" tabindex="0" role="region" aria-label="Regions" style="max-height:20rem"><table class="nv-table"><tbody></tbody></table></div>');
});

test('Field: label, hint and error are tied to the control by ids it makes', () => {
  const out = html(h(Field, { label: 'URL', hint: 'A page or a stream', error: 'Not a URL' }, h(Input, { box: true })));
  const id = out.match(/<label class="nv-label" for="([^"]+)">/)[1];
  const input = out.match(/<input[^>]*>/)[0];
  assert.match(input, new RegExp(`id="${id}"`));
  assert.match(input, /class="nv-input nv-input--box"/);
  assert.match(input, /aria-invalid="true"/);
  const [, hint, error] = input.match(/aria-describedby="([^" ]+) ([^"]+)"/);
  assert.match(out, new RegExp(`<p class="nv-hint" id="${hint}">A page or a stream</p>`));
  assert.match(out, new RegExp(`<p class="nv-error" id="${error}">Not a URL</p>`));
  const own = html(h(Field, { label: 'L' }, h(Select, { id: 'lang' })));
  assert.match(own, /for="lang"/);
  assert.match(own.match(/<select[^>]*>/)[0], /id="lang"/);
  assert.doesNotMatch(own, /aria-invalid|aria-describedby/);
});

test('Choice and Fieldset: the control inside its label; a switch has role switch', () => {
  assert.equal(
    html(h(Choice, { control: 'switch', label: 'Alerts', defaultChecked: true })),
    '<label class="nv-choice"><input class="nv-switch" type="checkbox" role="switch" checked=""/> Alerts</label>',
  );
  assert.match(html(h(Choice, { control: 'radio', label: 'Public', name: 'v' })), /<input class="nv-radio" type="radio" name="v"\/>/);
  assert.match(html(h(Fieldset, { legend: 'Checks' })), /^<fieldset class="nv-fieldset"><legend class="nv-legend">Checks<\/legend><\/fieldset>$/);
});

test('Tabs: the ARIA pattern, one tab in the tab order, the other panels hidden, no nv-tabs root', () => {
  const items = [
    { id: 'a', label: 'One', content: 'first' },
    { id: 'b', label: 'Two', content: 'second' },
  ];
  const out = html(h(Tabs, { label: 'Views', items, value: 'b', onChange() {} }));
  assert.doesNotMatch(out, /class="nv-tabs"/);
  assert.match(out, /<div class="nv-tabs__list" role="tablist" aria-label="Views">/);
  assert.equal((out.match(/tabindex="0"/g) || []).length, 3); // the selected tab and both panels
  assert.match(out, /role="tab"[^>]*aria-selected="false"[^>]*tabindex="-1">One/);
  assert.match(out, /role="tab"[^>]*aria-selected="true"[^>]*tabindex="0">Two/);
  assert.match(out, /tabindex="0" hidden="">first<\/div>/);
  assert.match(out, /tabindex="0">second<\/div>/);
});

test('Dialog: a native dialog named by its title, with a close button', () => {
  const out = html(h(Dialog, { open: false, onClose() {}, title: 'Delete?', actions: h(Button, null, 'Keep') }, 'Body'));
  const id = out.match(/<dialog class="nv-dialog" aria-labelledby="([^"]+)">/)[1];
  assert.match(out, new RegExp(`<h2 class="nv-dialog__title" id="${id}">Delete\\?</h2>`));
  assert.match(out, /<button class="nv-dialog__close" type="button" aria-label="Close">/);
  assert.match(out, /<div class="nv-dialog__body">Body<\/div><div class="nv-dialog__actions"><button/);
});
