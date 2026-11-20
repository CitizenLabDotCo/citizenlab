import { useEffect } from 'react';

import { useDragDropManager } from 'react-dnd';

// The key react-dnd's DndProvider uses to share one drag-and-drop manager
// (and so one HTML5 backend) between all providers on the page.
const SHARED_MANAGER_KEY = Symbol.for('__REACT_DND_CONTEXT_INSTANCE__');

type GlobalWithSharedManager = typeof globalThis & {
  [SHARED_MANAGER_KEY]?: { dragDropManager: unknown } | null;
};

// Nested DndProviders (e.g. the option list in the settings panel) normally
// reuse the builder's manager through that shared slot. But when the page we
// came from had its own provider, its cleanup empties the slot right after our
// provider picked the manager up. The next nested provider would then create a
// second HTML5 backend, which react-dnd refuses ("Cannot have two HTML5
// backends at the same time"). Putting our manager back avoids that.
const ShareDndManager = () => {
  const manager = useDragDropManager();

  useEffect(() => {
    const context: GlobalWithSharedManager = globalThis;
    if (context[SHARED_MANAGER_KEY]?.dragDropManager !== manager) {
      context[SHARED_MANAGER_KEY] = { dragDropManager: manager };
    }
  }, [manager]);

  return null;
};

export default ShareDndManager;
