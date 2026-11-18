# @nava-ui/react

Thin typed React wrappers over the [nava-ui](https://github.com/Allan-Nava/nava-ui) classes. The
look stays in the kit's CSS: load `nava-ui/dist/nava-ui.css` (or `nava-ui.components.css`) once
in the app, then use the components. Nothing here styles, and every component passes the other
props to its element and merges a `className`.

```tsx
import 'nava-ui/dist/nava-ui.css';
import { Button, Field, Input, Tabs, Dialog, DataTable, Badge } from '@nava-ui/react';

<Field label="URL" hint="A page or a stream" error={error}>
  <Input box type="url" />
</Field>
<Button variant="primary" busy={saving}>Save</Button>
```

| Component | Renders | Notes |
|---|---|---|
| `Button` | `nv-button` | `variant="primary"`; `busy` adds the spinner and `aria-busy`, keeps the label |
| `Badge` | `nv-badge` | `tone`: neutral, accent, warning, danger; `dot` |
| `Pill` | `nv-pill` with `nv-mark` | `kind` and `mark` tell the kind by shape; `srText` for screen readers |
| `Alert` | `nv-alert` | `tone`, `title`; `onDismiss` adds the close button |
| `EmptyState`, `Skeleton`, `Spinner` | `nv-empty`, `nv-skeleton`, `nv-spinner` | skeletons and spinners are `aria-hidden`: mark the loading region `aria-busy` |
| `Bento`, `Tile` | `nv-bento`, `nv-tile` | `width` 2, 3, 4 or 6; `tall`; `feature` |
| `DataTable` | `nv-table-wrap` + `nv-table` | a focusable region named by `label`; `maxHeight` for a sticky header |
| `Field` | `nv-field` | makes the ids: label `for`, hint and error in `aria-describedby`, `aria-invalid` with an error |
| `Input`, `Textarea`, `Select` | `nv-input` (`box`), `nv-textarea`, `nv-select` | refs forwarded |
| `Choice`, `Fieldset` | `nv-choice` with `nv-checkbox`, `nv-radio` or `nv-switch`; `nv-fieldset` | a switch gets `role="switch"` |
| `Tabs` | `nv-tabs__list`, `__tab`, `__panel` | controlled (`value`, `onChange`); arrows with wrap, Home, End, one tab in the tab order |
| `Dialog` | the native `<dialog class="nv-dialog">` | `open` and `onClose`; `showModal()` gives focus, Escape and the inert page; `dismissible` closes on a click outside |

`Tabs` and `Dialog` do in React what `nava-ui.js` does for plain HTML, so a React app does not
need the script for them. The Tabs root has no `nv-tabs` class, so the script, if loaded, leaves
it alone.

React 18 or later. The version follows the kit's: `@nava-ui/react@X.Y.Z` matches the classes of
nava-ui `vX.Y.Z`. Not published yet: it goes to npm with the kit (NV-23).

```bash
npm test -w packages/react      # tsc, then the render tests (node --test)
npm test                        # includes tests/react.spec.mjs: Tabs and Dialog in a browser
```
