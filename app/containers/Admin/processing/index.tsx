import React, { memo, useCallback, useState, useEffect, Suspense } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { includes } from 'lodash-es';

// components
import Table from 'components/UI/Table';
import ModerationRow from './ModerationRow';
import Checkbox from 'components/UI/Checkbox';
import { Icon, Button, Select } from 'cl2-component-library';

import SelectProject from './SelectProject';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings

import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { adopt } from 'react-adopt';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { IIdeaData } from 'services/ideas';
import LazyPostPreview from 'components/admin/PostManager/components/LazyPostPreview';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 80px;
`;

const Filters = styled.div`
  position: fixed;
  min-height: 80vh;
  max-width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
  margin-bottom: 55px;
  z-index: 100;
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
  ({ className, intl, ideas, topics }) => {
    const [ideaList, setIdeaList] = useState<IIdeaData[] | undefined | null>(
      ideas.list
    );
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const [previewPostId, setPreviewPostId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'view' | 'edit'>('view');
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

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
      (selectedModerationId: string) => {
        if (!processing) {
          const newSelectedRows = includes(selectedRows, selectedModerationId)
            ? selectedRows.filter((id) => id !== selectedModerationId)
            : [...selectedRows, selectedModerationId];
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
      if (!processing) {
        setIdeaList(ideas?.list);
      }
    }, [ideas, processing]);

    if (!isNilOrError(ideaList)) {
      return (
        <Container className={className}>
          <Filters>
            <div>
              <SelectProject
                selectedProjectIds={selectedProjectIds}
                onChange={handleProjectIdsChange}
              />
              <Button locale="en">Autotag</Button>
            </div>

            {/* <StyledSearchInput onChange={handleSearchTermChange} /> */}
            <Button locale="en">Export</Button>
          </Filters>

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
                  <FormattedMessage {...messages.title} />
                </th>
                <th className="tags">
                  <FormattedMessage {...messages.tags} />
                </th>
                {/* <th className="goto">&nbsp;</th> */}
              </tr>
            </thead>
            {ideaList?.length > 0 && (
              <tbody>
                {ideaList?.map((moderationItem) => (
                  <ModerationRow
                    key={moderationItem.id}
                    idea={moderationItem}
                    selected={includes(selectedRows, moderationItem.id)}
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
              onClose={() => setPreviewPostId(null)}
              onSwitchPreviewMode={() =>
                setPreviewMode(previewMode === 'edit' ? 'view' : 'edit')
              }
            />
          </Suspense>
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
