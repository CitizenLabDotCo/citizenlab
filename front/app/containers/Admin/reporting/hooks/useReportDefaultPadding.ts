import { useReportContext } from '../context/ReportContext';
import { ROOT_NODE, useNode, useEditor } from '@craftjs/core';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

// Based on useCraftComponentDefaultPadding hook in
// app/components/admin/ContentBuilder/useCraftComponentDefaultPadding.ts
// This one also needs to handle pdf reports and report templates
// so it's a bit more complex. Maybe eventually we can combine them.
const useReportDefaultPadding = () => {
  const {
    query: { node },
  } = useEditor();
  const { parentId } = useNode((node) => ({
    parentId: node.data.parent,
  }));

  const { width } = useReportContext();
  if (width === 'pdf') return '0px';

  const parentIsRoot = parentId === ROOT_NODE;

  const grandParentId = parentId ? node(parentId).ancestors()[0] : undefined;
  const grandParentNode = grandParentId ? node(grandParentId) : undefined;
  const greatGrandParentId = grandParentNode
    ? grandParentNode.ancestors()[0]
    : undefined;

  const grandParentIsTemplateAndGreatGrandparentIsRoot =
    grandParentNode?.get().data.name === 'ProjectTemplate' && greatGrandParentId
      ? node(greatGrandParentId).isRoot()
      : false;

  const isSmall = width === 'mobile' || width === 'tablet';
  const inRoot = parentIsRoot || grandParentIsTemplateAndGreatGrandparentIsRoot;

  return isSmall && inRoot ? DEFAULT_PADDING : '0px';
};

export default useReportDefaultPadding;
