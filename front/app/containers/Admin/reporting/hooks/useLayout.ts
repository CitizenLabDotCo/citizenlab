import { useNode, useEditor } from '@craftjs/core';
import { useContext } from 'react';
import { ReportContext } from '../context/ReportContext';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { Layout } from 'components/admin/GraphCards/typings';

export default function useLayout(): Layout {
  const narrowLayout = useNarrowLayout();
  const reportContext = useContext(ReportContext);
  const smallerThanPhone = useBreakpoint('phone');

  if (reportContext === 'pdf') {
    return narrowLayout ? 'narrow' : 'wide';
  }

  return smallerThanPhone ? 'narrow' : 'wide';
}

function useNarrowLayout() {
  const { id } = useNode();
  const {
    parentId,
    query: { node },
  } = useEditor((_, query) => ({
    parentId: id ? query.node(id)?.ancestors()[0] : undefined,
  }));

  if (!parentId) return false;
  const grandParentId = node(parentId)?.ancestors()[0];
  if (!grandParentId) return false;

  const grandParentNode = node(grandParentId)?.get();
  const isInNarrowLayout = !!(grandParentNode?.data.name === 'TwoColumn');

  return isInNarrowLayout;
}
