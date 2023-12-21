import { useReportContext } from '../context/ReportContext';
import { useNode, useEditor } from '@craftjs/core';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { Layout } from 'components/admin/GraphCards/typings';

export default function useLayout(): Layout {
  const narrowLayout = useNarrowLayout();
  const reportContext = useReportContext();
  const smallerThanPhone = useBreakpoint('phone');

  if (narrowLayout) return 'narrow';
  if (reportContext.width === 'pdf') return 'wide';

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
