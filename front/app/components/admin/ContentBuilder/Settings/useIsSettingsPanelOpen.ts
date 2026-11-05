import { useEditor, ROOT_NODE } from '@craftjs/core';

// Mirrors the visibility condition of ContentBuilderSettings so the content
// canvas can reserve space for the settings panel while it is open.
const useIsSettingsPanelOpen = () => {
  const { isOpen } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    const node = currentNodeId ? state.nodes[currentNodeId] : undefined;

    return {
      isOpen:
        !!node &&
        state.options.enabled &&
        currentNodeId !== ROOT_NODE &&
        node.data.name !== 'Box',
    };
  });

  return isOpen;
};

export default useIsSettingsPanelOpen;
