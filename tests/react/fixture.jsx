// A page for the browser test of @nava-ui/react's Tabs and Dialog (tests/react.spec.mjs),
// bundled by esbuild from the package's sources when the test starts.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Tabs, Dialog, Button } from '../../packages/react/src/index.ts';

function App() {
  const [tab, setTab] = useState('one');
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(0);
  return (
    <main>
      <Tabs
        label="React tabs"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'one', label: 'One', content: <p>First panel</p> },
          { id: 'two', label: 'Two', content: <p>Second panel</p> },
          { id: 'three', label: 'Three', content: <p>Third panel</p> },
        ]}
      />
      <Button onClick={() => setOpen(true)}>Open the React dialog</Button>
      <p data-closed>{closed}</p>
      <Dialog
        open={open}
        onClose={() => { setOpen(false); setClosed((n) => n + 1); }}
        title="A React dialog"
        actions={<Button variant="primary" onClick={() => setOpen(false)}>Done</Button>}
      >
        <p>Opened with showModal().</p>
      </Dialog>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
