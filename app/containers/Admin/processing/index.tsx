import React, { memo, useCallback, useState, useEffect, Suspense } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { includes } from 'lodash-es';

// components
import Table from 'components/UI/Table';
import ProcessingRow from './ProcessingRow';
import { Icon, Button, Select, Checkbox } from 'cl2-component-library';
import LazyPostPreview from 'components/admin/PostManager/components/LazyPostPreview';
import Modal, {
  ButtonsWrapper,
  Content,
  ModalContentContainer,
} from 'components/UI/Modal';
import SelectProject from '../moderation/SelectProject';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';

// typings
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { adopt } from 'react-adopt';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { IIdeaData } from 'services/ideas';

// hooks
import useKeyPress from '../../../hooks/useKeyPress';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 80px;
`;

const SidePanel = styled.div`
  position: fixed;
  height: calc(100vh - 200px);
  max-width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
  margin-bottom: 55px;
  z-index: 100;
`;

const StyledActions = styled.div`
  > * {
    margin: 10px;
  }
`;

const StyledTable = styled(Table)`
  margin-left: 150px;
  th,
  td {
    text-align: left;
    vertical-align: top;
    padding-left: 0px;
    padding-right: 20px;

    &.checkbox {
      width: 70px;
      padding-left: 8px;
    }

    &.content {
      width: 50%;
      padding-right: 25px;
    }
  }
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: 0px;
`;

interface DataProps {
  ideas: GetIdeasChildProps;
  topics: GetTopicsChildProps;
}

interface InputProps {
  className?: string;
}

interface Props extends InputProps, DataProps {}

const Processing = memo<Props & InjectedIntlProps>(
  ({ className, ideas, topics }) => {
    const [ideaList, setIdeaList] = useState<IIdeaData[] | undefined | null>(
      ideas.list
    );

    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [processing, setProcessing] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [previewPostId, setPreviewPostId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'view' | 'edit'>('view');
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const upArrow = useKeyPress('ArrowUp');
    const downArrow = useKeyPress('ArrowDown');

    const handleOnSelectAll = useCallback(
      (_event: React.ChangeEvent) => {
        if (!isNilOrError(ideaList) && !processing) {
          const newSelectedRows =
            selectedRows.length < ideaList.length
              ? ideaList.map((item) => item.id)
              : [];
          setSelectedRows(newSelectedRows);
        }
      },
      [ideaList, selectedRows, processing]
    );

    const handleProjectIdsChange = useCallback((newProjectIds: string[]) => {
      const { onChangeProjects } = ideas as GetIdeasChildProps;
      setSelectedProjectIds(newProjectIds);
      onChangeProjects(newProjectIds);
      trackEventByName(tracks.projectFilterUsed);
    }, []);

    const handleRowOnSelect = useCallback(
      (selectedItemId: string) => {
        if (!processing) {
          const newSelectedRows = includes(selectedRows, selectedItemId)
            ? selectedRows.filter((id) => id !== selectedItemId)
            : [...selectedRows, selectedItemId];
          setSelectedRows(newSelectedRows);
        }
      },
      [selectedRows, processing]
    );

    const openPreview = (id: string) => {
      setPreviewPostId(id);
    };

    useEffect(() => {
      if (!processing) {
        setSelectedRows([]);
      }
    }, [processing]);

    useEffect(() => {
      if (upArrow && ideaList) {
        if (!previewPostId) {
          setPreviewPostId(ideaList[0].id);
        } else {
          const ideaIndex = ideaList.findIndex(
            (idea) => idea.id === previewPostId
          );
          const newIndex =
            ideaIndex === 0 ? ideaList.length - 1 : ideaIndex - 1;
          setPreviewPostId(ideaList[newIndex].id);
        }
      }
    }, [upArrow]);

    useEffect(() => {
      if (downArrow && ideaList) {
        if (!previewPostId) {
          setPreviewPostId(ideaList[0].id);
        } else {
          const ideaIndex = ideaList.findIndex(
            (idea) => idea.id === previewPostId
          );
          const newIndex =
            ideaIndex === ideaList.length - 1 ? 0 : ideaIndex + 1;
          setPreviewPostId(ideaList[newIndex].id);
        }
      }
    }, [downArrow]);

    useEffect(() => {
      if (!processing) {
        setIdeaList(ideas?.list);
      }
    }, [ideas, processing]);

    const closeModal = () => setIsModalOpen(false);
    const openModal = () => setIsModalOpen(true);
    const exportIdeasAsXlsx = () => console.log(selectedRows);
    const closeSideModal = () => setPreviewPostId(null);
    const confirmTags = () => console.log('confirm Tags');
    const switchPreviewMode = () =>
      setPreviewMode(previewMode === 'edit' ? 'view' : 'edit');

    if (!isNilOrError(ideaList)) {
      return (
        <Container className={className}>
          <SidePanel>
            <SelectProject
              selectedProjectIds={selectedProjectIds}
              onChange={handleProjectIdsChange}
            />
            <StyledActions>
              <Button
                locale="en"
                buttonStyle="admin-dark"
                disabled={!!(selectedRows.length === 0)}
                processing={processing}
                onClick={openModal}
              >
                <FormattedMessage {...messages.autotag} />
              </Button>

              <Button
                locale="en"
                buttonStyle="admin-dark-outlined"
                disabled={!!(selectedRows.length === 0)}
                processing={processing}
                onClick={exportIdeasAsXlsx}
              >
                <FormattedMessage {...messages.export} />
              </Button>
            </StyledActions>
          </SidePanel>
          <StyledTable>
            <thead>
              <tr>
                <th className="checkbox">
                  <StyledCheckbox
                    checked={
                      ideaList.length > 0 &&
                      selectedRows.length === ideaList?.length
                    }
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < ideaList.length
                    }
                    disabled={ideaList?.length === 0}
                    onChange={handleOnSelectAll}
                  />
                </th>

                <th className="title">
                  <FormattedMessage
                    {...messages.items}
                    values={{
                      amount: ideaList.length,
                    }}
                  />
                </th>
                <th className="tags">
                  <FormattedMessage {...messages.tags} />
                </th>
              </tr>
            </thead>
            {ideaList?.length > 0 && (
              <tbody>
                {ideaList?.map((idea) => (
                  <ProcessingRow
                    key={idea.id}
                    idea={idea}
                    selected={includes(selectedRows, idea.id)}
                    highlighted={idea.id === previewPostId}
                    onSelect={handleRowOnSelect}
                    openPreview={openPreview}
                  />
                ))}
              </tbody>
            )}
          </StyledTable>
          <Suspense fallback={null}>
            <LazyPostPreview
              type={'AllIdeas'}
              postId={previewPostId}
              mode={previewMode}
              onClose={closeSideModal}
              onSwitchPreviewMode={switchPreviewMode}
            />
          </Suspense>
          <Modal
            opened={isModalOpen}
            close={closeModal}
            header={<FormattedMessage {...messages.autotag} />}
          >
            <ModalContentContainer>
              <Content>
                <FormattedMessage {...messages.export} />
              </Content>
              <ButtonsWrapper>
                <Button buttonStyle="secondary" onClick={confirmTags}>
                  Confirm
                </Button>
              </ButtonsWrapper>
            </ModalContentContainer>
          </Modal>
        </Container>
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  ideas: ({ render }) => {
    return (
      <GetIdeas
        type="paginated"
        pageSize={2000000}
        sort="new"
        projectIds={undefined}
      >
        {render}
      </GetIdeas>
    );
  },
  topics: ({ render }) => {
    return <GetTopics>{render}</GetTopics>;
  },
});

const ProcessingWithIntl = injectIntl(Processing);

export default (inputProps: InputProps) => {
  return (
    <Data {...inputProps}>
      {(dataProps) => <ProcessingWithIntl {...inputProps} {...dataProps} />}
    </Data>
  );
};
