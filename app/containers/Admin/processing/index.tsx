import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  Suspense,
  FormEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { includes } from 'lodash-es';

// components
import Table from 'components/UI/Table';
import ProcessingRow from './ProcessingRow';
import { Checkbox } from 'cl2-component-library';
import Button from 'components/UI/Button';
import LazyPostPreview from 'components/admin/PostManager/components/LazyPostPreview';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';

// typings
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { adopt } from 'react-adopt';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { IIdeaData } from 'services/ideas';

// hooks
import useKeyPress from '../../../hooks/useKeyPress';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';
import useLocalize from 'hooks/useLocalize';

// resources
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import { reportError } from 'utils/loggingUtils';
import useTagSuggestion from 'hooks/useTags';

import { saveAs } from 'file-saver';

const Container = styled.div`
  padding-top: 45px;
  padding-right: 51px;
  padding-bottom: 0px;
  padding-left: 24px;

  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 80px;
`;

const SidePanel = styled.div`
  position: fixed;
  height: calc(100vh - ${stylingConsts.menuHeight});
  max-width: 150px;
  display: flex;
  flex-direction: column;
  z-index: 100;
`;

const StyledActions = styled.div`
  > * {
    margin-top: 10px;
  }
`;

const StyledTable = styled(Table)`
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;
  margin-left: 150px;
  tbody tr td {
    padding-top: 12px;
    padding-bottom: 10px;
  }
  tbody tr {
    border-radius: 3px;
    border-bottom: 1px solid #eaeaea;
  }

  thead tr th {
    font-size: 12px;
    height: 24px;
    padding-left: 8px;
    padding-right: 8px;
  }

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
  projects: GetProjectsChildProps;
}

interface InputProps {
  className?: string;
}

interface Props extends InputProps, DataProps {}

const Processing = memo<Props & InjectedIntlProps>(
  ({ className, ideas, projects }) => {
    const localize = useLocalize();

    // const [showTopics, setShowTopics] = useState<boolean>(false);

    const [ideaList, setIdeaList] = useState<IIdeaData[] | undefined | null>(
      []
    );
    const [projectList, setProjectList] = useState<IFilterSelectorValue[]>([]);

    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const { tagSuggestion, onIdeasChange } = useTagSuggestion();

    const [processing, setProcessing] = useState<boolean>(false);
    const [exporting, setExporting] = useState<boolean>(false);
    const [previewPostId, setPreviewPostId] = useState<string | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'view' | 'edit'>('view');
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

    const upArrow = useKeyPress('ArrowUp');
    const downArrow = useKeyPress('ArrowDown');
    const enterModalKey = useKeyPress('ArrowRight');

    useEffect(() => {
      if (
        !isNilOrError(projects.projectsList) &&
        projects.projectsList?.length > 0
      ) {
        const filterSelectorValues: IFilterSelectorValue[] = projects.projectsList.map(
          (project) => {
            return {
              text: localize(project.attributes.title_multiloc),
              value: project.id,
            };
          }
        );
        setProjectList(filterSelectorValues);
      }
    }, [projects]);

    useEffect(() => {
      if (upArrow && ideaList) {
        if (!highlightedId && !previewPostId) {
          setHighlightedId(ideaList[0].id);
        } else {
          const ideaIndex = ideaList.findIndex(
            (idea) => idea.id === highlightedId
          );
          const newIndex =
            ideaIndex === 0 ? ideaList.length - 1 : ideaIndex - 1;
          setHighlightedId(ideaList[newIndex].id);
          if (previewPostId) {
            setPreviewPostId(ideaList[newIndex].id);
          }
        }
      }
    }, [upArrow]);

    useEffect(() => {
      if (downArrow && ideaList) {
        if (!highlightedId && !previewPostId) {
          setHighlightedId(ideaList[0].id);
        } else {
          const ideaIndex = ideaList.findIndex(
            (idea) => idea.id === highlightedId
          );
          const newIndex =
            ideaIndex === ideaList.length - 1 ? 0 : ideaIndex + 1;
          setHighlightedId(ideaList[newIndex].id);

          if (previewPostId) {
            setPreviewPostId(ideaList[newIndex].id);
          }
        }
      }
    }, [downArrow]);

    useEffect(() => {
      if (enterModalKey && ideaList) {
        if (!highlightedId) {
          setHighlightedId(ideaList[0].id);
          setPreviewPostId(ideaList[0].id);
        } else {
          setPreviewPostId(highlightedId);
        }
      }
    }, [enterModalKey]);

    useEffect(() => {
      if (!processing) {
        setIdeaList(ideas?.list);
      }
    }, [ideas, processing]);

    useEffect(() => {
      if (processing) {
        setProcessing(false);
      }
    }, [tagSuggestion]);

    const handleExportSelectedIdeasAsXlsx = async () => {
      trackEventByName(tracks.clickExportIdeas.name);
      const exportQueryParameter = selectedRows;

      const queryParametersObject = {};
      if (
        typeof exportQueryParameter === 'string' &&
        exportQueryParameter !== 'all'
      ) {
        queryParametersObject['project'] = exportQueryParameter;
      } else if (typeof exportQueryParameter !== 'string') {
        queryParametersObject['ideas'] = exportQueryParameter;
      }

      try {
        setExporting(true);
        console.log(0);
        const blob = await requestBlob(
          `${API_PATH}/ideas/as_xlsx_with_tags`,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          queryParametersObject
        );
        console.log(1);
        console.log(saveAs, blob);
        saveAs(blob, 'ideas-export.xlsx');

        setExporting(false);
      } catch (error) {
        console.log(error);
        reportError(error);
        setExporting(false);
      }
    };

    const handleAutoTag = (e: FormEvent) => {
      e.preventDefault;
      trackEventByName(tracks.clickAutotag.name);

      setProcessing(true);
      onIdeasChange(selectedRows);
    };

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

    const handleProjectIdsChange = (newProjectIds: string[]) => {
      const { onChangeProjects } = ideas as GetIdeasChildProps;

      setSelectedProjectIds(newProjectIds);
      newProjectIds.length > 0
        ? onChangeProjects(newProjectIds)
        : onChangeProjects([...projectList.map((project) => project.value)]);
    };

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
    const closeSideModal = () => setPreviewPostId(null);
    const switchPreviewMode = () =>
      setPreviewMode(previewMode === 'edit' ? 'view' : 'edit');
    console.log(tagSuggestion);

    if (!isNilOrError(ideaList)) {
      return (
        <Container className={className}>
          <SidePanel>
            <FilterSelector
              title={<FormattedMessage {...messages.project} />}
              name={'Projects'}
              values={projectList}
              onChange={handleProjectIdsChange}
              multipleSelectionAllowed={true}
              selected={selectedProjectIds}
            />

            <StyledActions>
              <Button
                buttonStyle="admin-dark"
                disabled={!!(selectedRows.length === 0)}
                processing={processing}
                onClick={(e) => handleAutoTag(e)}
              >
                <FormattedMessage {...messages.autotag} />
              </Button>

              <Button
                buttonStyle="admin-dark-outlined"
                disabled={!!(selectedRows.length === 0)}
                processing={exporting}
                onClick={handleExportSelectedIdeasAsXlsx}
              >
                <FormattedMessage {...messages.export} />
              </Button>
              {!isNilOrError(tagSuggestion) &&
                tagSuggestion.map((tag, index) => (
                  <div key={index}>
                    {localize(tag.attributes.title_multiloc)}
                  </div>
                ))}
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
                      items: selectedRows.length > 1 ? 'items' : 'item',
                      amount: ideaList.length,
                      selected: selectedRows.length,
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
                    highlighted={idea.id === highlightedId}
                    onSelect={handleRowOnSelect}
                    openPreview={openPreview}
                    tagSuggestion={tagSuggestion?.filter((tag) =>
                      tag.idea_ids.includes(idea.id)
                    )}
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
        </Container>
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  projects: ({ render }) => {
    return (
      <GetProjects
        publicationStatuses={['published', 'archived']}
        filterCanModerate={true}
      >
        {render}
      </GetProjects>
    );
  },
  ideas: ({ render, projects }) => {
    const projectIds = projects?.projectsList?.map((project) => project.id);
    return (
      <GetIdeas
        type="paginated"
        pageSize={2000000}
        sort="new"
        projectIds={projectIds}
      >
        {render}
      </GetIdeas>
    );
  },
  topics: ({ render, ideas }) => {
    const topicIds: string[] = [];
    ideas.list?.forEach((idea) =>
      idea?.relationships?.topics?.data.forEach((topic) =>
        topicIds.push(topic.id)
      )
    );
    return <GetTopics topicIds={topicIds}>{render}</GetTopics>;
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
