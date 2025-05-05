import React, { useState } from 'react';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Spinner,
  colors,
  stylingConsts,
  Button,
  Icon,
} from '@citizenlab/cl2-component-library';

import { IIdeaData, IIdeaQueryParameters } from 'api/ideas/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useIdeas from 'api/ideas/useIdeas';

import { ManagerType, PreviewMode } from 'components/admin/PostManager';
import PostPreview from 'components/admin/PostManager/components/PostPreview';
import {
  NoPostPage,
  NoPostHeader,
  NoPostDescription,
} from 'components/admin/PostManager/components/PostTable/NoPost';
import { TitleLink } from 'components/admin/PostManager/components/PostTable/Row';
import Pagination from 'components/Pagination';
import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from './messages';

interface Props {
  projectId: string;
  phaseId: string;
}

const CommonGroundInputManager = ({ projectId, phaseId }: Props) => {
  const [queryParameters, setQueryParameters] = useState<IIdeaQueryParameters>({
    'page[size]': 10,
    'page[number]': 1,
    sort: 'new',
    projects: [projectId],
    phase: phaseId,
    transitive: true,
  });
  const { data: ideas, isLoading } = useIdeas(queryParameters);
  const { mutateAsync: deleteIdea } = useDeleteIdea();
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [warningOpen, setWarningOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openPreview = (id: string) => {
    setPreviewPostId(id);
    setPreviewMode('view');
  };
  const closePreview = () => {
    setPreviewPostId(null);
    setPreviewMode('view');
  };
  // Selection handlers
  const allSelected =
    ideas &&
    ideas.data.length > 0 &&
    ideas.data.every((i) => selection.has(i.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelection(new Set());
    else if (ideas) setSelection(new Set(ideas.data.map((i) => i.id)));
  };
  const toggleSelect = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const handleDeleteSelected = async () => {
    setDeleting(true);
    for (const id of selection) {
      await deleteIdea(id);
    }
    setDeleting(false);
    setSelection(new Set());
    setWarningOpen(false);
  };

  if (isLoading || !ideas) {
    return (
      <Box display="flex" justifyContent="center" p="20px">
        <Spinner />
      </Box>
    );
  }

  if (ideas.data.length === 0) {
    return (
      <NoPostPage>
        <Icon name="sidebar-pages-menu" />
        <NoPostHeader>
          <FormattedMessage {...messages.noInputs} />
        </NoPostHeader>
        <NoPostDescription>
          <FormattedMessage {...messages.noInputsDescription} />
        </NoPostDescription>
        <Box display="flex" gap="8px">
          <Button buttonStyle="secondary-outlined" width="auto">
            <FormattedMessage {...messages.createInput} />
          </Button>
          <Button buttonStyle="admin-dark">
            <FormattedMessage {...messages.startFromPastInputs} />
          </Button>
        </Box>
      </NoPostPage>
    );
  }

  const currentPage = getPageNumberFromUrl(ideas.links.self) || 1;
  const lastPage = getPageNumberFromUrl(ideas.links.last) || 1;

  return (
    <>
      <Table
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{ headerCells: true, bodyRows: true }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <Th>
              <FormattedMessage {...messages.title} />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {ideas.data.map((idea: IIdeaData) => (
            <Tr key={idea.id}>
              <Td borderBottom="none !important">
                <TitleLink
                  className="e2e-common-ground-input-manager-title"
                  onClick={(e) => {
                    e.preventDefault();
                    openPreview(idea.id);
                  }}
                >
                  <T value={idea.attributes.title_multiloc} />
                </TitleLink>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {lastPage > 1 && (
        <Box mt="16px">
          <Pagination
            currentPage={currentPage}
            totalPages={lastPage}
            loadPage={(page: number) =>
              setQueryParameters({ ...queryParameters, 'page[number]': page })
            }
          />
        </Box>
      )}
      <PostPreview
        type={'ProjectIdeas' as ManagerType}
        postId={previewPostId}
        selectedPhaseId={phaseId}
        mode={previewMode}
        onClose={closePreview}
        onSwitchPreviewMode={() =>
          setPreviewMode((mode) => (mode === 'view' ? 'edit' : 'view'))
        }
      />
    </>
  );
};

export default CommonGroundInputManager;
