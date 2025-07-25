import React, { useEffect, useState } from 'react';

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
  Checkbox,
} from '@citizenlab/cl2-component-library';

import useJobInProgressByPhase from 'api/copy_inputs/useJobInProgressByPhase';
import { IIdeaData, IIdeaQueryParameters } from 'api/ideas/types';
import useIdeas from 'api/ideas/useIdeas';
import useProjectById from 'api/projects/useProjectById';

import {
  PreviewMode,
  StyledExportMenu,
  TopActionBar,
} from 'components/admin/PostManager';
import ActionBar from 'components/admin/PostManager/components/ActionBar';
import PostPreview from 'components/admin/PostManager/components/PostPreview';
import { TitleLink } from 'components/admin/PostManager/components/PostTable/Row';
import Pagination from 'components/Pagination';
import T from 'components/T';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from './messages';
import NoInputsDisplay from './NoInputsDisplay';

interface Props {
  projectId: string;
  phaseId: string;
  setShowPastInputsModal: (value: React.SetStateAction<boolean>) => void;
}

const CommonGroundInputManager = ({
  projectId,
  phaseId,
  setShowPastInputsModal,
}: Props) => {
  const { data: project } = useProjectById(projectId);
  const [queryParameters, setQueryParameters] = useState<IIdeaQueryParameters>({
    'page[size]': 10,
    'page[number]': 1,
    sort: 'new',
    projects: [projectId],
    phase: phaseId,
    transitive: false,
  });

  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const { data: jobProgressData } = useJobInProgressByPhase(phaseId);
  const { progress: importedCount, total: totalInputsToBeImported } =
    jobProgressData?.data[0]?.attributes || {};
  const isJobInProgress = importedCount !== undefined;

  const resetSelection = () => setSelection(new Set());

  useEffect(() => {
    setQueryParameters((prevParams) => ({
      ...prevParams,
      'page[number]': 1,
      projects: [projectId],
      phase: phaseId,
    }));

    resetSelection();
  }, [projectId, phaseId]);

  const { data: ideas, isLoading } = useIdeas(queryParameters);

  const openPreviewEdit = () => {
    const id = [...selection][0];
    if (selection.size === 1 && id) {
      setPreviewMode('edit');
      setPreviewPostId(id);
    }
  };

  const openPreview = (id: string) => {
    setPreviewPostId(id);
    setPreviewMode('view');
  };
  const closePreview = () => {
    setPreviewPostId(null);
    setPreviewMode('view');
  };

  const allSelected = !!(
    ideas &&
    ideas.data.length > 0 &&
    ideas.data.every((i) => selection.has(i.id))
  );
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p="20px">
        <Spinner />
      </Box>
    );
  }

  if (!ideas) {
    return null;
  }

  if (ideas.data.length === 0) {
    return (
      <NoInputsDisplay
        isJobInProgress={isJobInProgress}
        importedCount={importedCount}
        totalInputsToBeImported={totalInputsToBeImported}
        project={project?.data}
        phaseId={phaseId}
        setShowPastInputsModal={setShowPastInputsModal}
      />
    );
  }

  const currentPage = getPageNumberFromUrl(ideas.links.self) || 1;
  const lastPage = getPageNumberFromUrl(ideas.links.last) || 1;

  return (
    <>
      {isJobInProgress && (
        <Warning>
          <Box display="flex">
            <FormattedMessage
              {...messages.inputImportProgress}
              values={{ importedCount, totalCount: totalInputsToBeImported }}
            />
          </Box>
        </Warning>
      )}
      <TopActionBar>
        <StyledExportMenu
          type={'ProjectProposals'}
          selection={selection}
          selectedProject={projectId}
        />
      </TopActionBar>
      {selection.size > 0 && (
        <Box mb="16px">
          <ActionBar
            selection={selection}
            resetSelection={resetSelection}
            handleClickEdit={openPreviewEdit}
          />
        </Box>
      )}
      <Table
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{ headerCells: true, bodyRows: true }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <Th>
              <Checkbox
                size="21px"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
            </Th>
            <Th>
              <FormattedMessage {...messages.title} />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {ideas.data.map((idea: IIdeaData) => (
            <Tr
              key={idea.id}
              background={selection.has(idea.id) ? colors.grey300 : undefined}
            >
              <Td>
                <Checkbox
                  size="21px"
                  checked={selection.has(idea.id)}
                  onChange={() => toggleSelect(idea.id)}
                />
              </Td>
              <Td>
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
        type="ProjectIdeas"
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
