import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  useRef,
  FormEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { includes } from 'lodash-es';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import { reportError } from 'utils/loggingUtils';
import { saveAs } from 'file-saver';

// components
import ProcessingRow from './ProcessingRow';
import AutotagView from './AutotagView';
import { Checkbox, fontSizes, Spinner, Button } from 'cl2-component-library';
import Table from 'components/UI/Table';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { stylingConsts, colors } from 'utils/styleUtils';

// typings
import { adopt } from 'react-adopt';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { IIdeaData } from 'services/ideas';

// hooks & res
import useKeyPress from '../../../hooks/useKeyPress';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';
import useLocalize from 'hooks/useLocalize';
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import PostPreview from './PostPreview';
import { CSSTransition } from 'react-transition-group';

const Container = styled.div`
  height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

const StyledSpinner = styled(Spinner)`
  margin: auto;
`;

const PostPreviewTransitionWrapper = styled.div`
  &.slide-enter {
    transform: translateX(100%);
    opacity: 0;

    &.slide-enter-active {
      transition: 1000ms;
      transform: translateX(0%);
      opacity: 1;
    }
  }

  &.slide-exit {
    transition: 1000ms;
    transform: translateX(0%);
    opacity: 1;

    &.slide-exit-active {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

const FilterSectionTransitionWrapper = styled.div`
  &.slide-enter {
    transform: translateX(-100%);

    &.slide-enter-active {
      transition: 1000ms;
      transform: translateX(0%);
    }
  }

  &.slide-exit {
    transition: 1000ms;
    transform: translateX(0%);

    &.slide-exit-active {
      transform: translateX(-100%);
    }
  }
`;

const FilterSection = styled.div`
  padding-top: 45px;
  padding-right: 18px;
  padding-left: 18px;
  position: sticky;
  top: ${stylingConsts.menuHeight}px;
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  max-width: 150px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  background-color: #f9f9fa;
`;

const StyledActions = styled.div`
  > * {
    margin-top: 10px;
  }
`;

const StyledFilterSelector = styled(FilterSelector)`
  &:not(:last-child) {
    margin-right: 0px;
  }
`;

const TableWrapper = styled.div`
  flex: 1;
  max-width: 100%;
  background: white;
  overflow-y: auto;
  padding: 24px;
`;

const StyledTable = styled(Table)`
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  text-decoration: none;
  tbody tr td {
    padding-top: 12px;
    padding-bottom: 10px;
  }
  tbody tr {
    border-radius: 3px;
    border-bottom: 1px solid #eaeaea;
  }

  thead tr th {
    font-size: ${fontSizes.xs}px;
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

const InformationBox = styled.div`
  margin: 24px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 27px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.clBlueDarkBg};
`;

interface DataProps {
  ideas: GetIdeasChildProps;
  projects: GetProjectsChildProps;
}

interface InputProps {
  className?: string;
}

interface Props extends InputProps, DataProps {}

const Processing = memo<Props & InjectedIntlProps>(
  ({ className, ideas, projects }) => {
    const localize = useLocalize();
    const tenant = useTenant();
    const locale = useLocale();

    const [ideaList, setIdeaList] = useState<IIdeaData[] | undefined | null>(
      []
    );
    const [projectList, setProjectList] = useState<IFilterSelectorValue[]>([]);

    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const [processing] = useState<boolean>(false);
    const [exporting, setExporting] = useState<boolean>(false);

    const [loadingIdeas, setLoadingIdeas] = useState<boolean>(false);
    const [previewPostId, setPreviewPostId] = useState<string | null>(null);
    const [isAutotagMode, setIsAutotagMode] = useState<boolean>(false);

    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

    const upArrow = useKeyPress('ArrowUp');
    const downArrow = useKeyPress('ArrowDown');
    const enterModalKey = useKeyPress('ArrowRight');
    const exitModalKey = useKeyPress('ArrowLeft');

    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (highlightedId && !isNilOrError(rowRef) && rowRef.current) {
        rowRef.current.scrollIntoView(true);
      }
    }, [highlightedId]);

    useEffect(() => {
      if (
        !isNilOrError(projects) &&
        !isNilOrError(projects.projectsList) &&
        projects.projectsList?.length > 0 &&
        tenant &&
        locale
      ) {
        const filterSelectorValues = [
          ...projects.projectsList
            .filter(
              (project) =>
                project.attributes.process_type === 'timeline' ||
                !['information', 'survey', 'volunteering', null].includes(
                  project.attributes.participation_method
                )
            )
            .map((project) => ({
              text: localize(project.attributes.title_multiloc),
              value: project.id,
            })),
        ];
        setProjectList(filterSelectorValues);
      }
    }, [projects, tenant, locale]);

    useEffect(() => {
      if (upArrow) {
        navigate('up');
      }
    }, [upArrow, ideaList]);

    useEffect(() => {
      if (downArrow) {
        navigate('down');
      }
    }, [downArrow, ideaList]);

    useEffect(() => {
      console.log('right arrow');
      if (enterModalKey && !isNilOrError(ideaList) && ideaList.length > 0) {
        if (!highlightedId) {
          setHighlightedId(ideaList[0].id);
          setPreviewPostId(ideaList[0].id);
        } else {
          setPreviewPostId(highlightedId);
        }
      }
    }, [enterModalKey, ideaList]);

    useEffect(() => {
      if (exitModalKey && ideaList) {
        setPreviewPostId('');
      }
    }, [exitModalKey, ideaList]);

    useEffect(() => {
      if (!processing && selectedProjectIds.length > 0) {
        setIdeaList(ideas?.list);
      }
    }, [ideas, processing]);

    useEffect(() => {
      if (loadingIdeas) {
        setLoadingIdeas(false);
      }
    }, [ideaList]);

    const handleExportSelectedIdeasAsXlsx = async () => {
      trackEventByName(tracks.clickExportIdeas.name);

      try {
        setExporting(true);
        const blob = await requestBlob(
          `${API_PATH}/ideas/as_xlsx_with_tags`,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          { ideas: selectedRows }
        );
        saveAs(blob, 'ideas-export.xlsx');

        setExporting(false);
      } catch (error) {
        reportError(error);
        setExporting(false);
      }
    };

    const handleAutoTag = (e: FormEvent) => {
      e.preventDefault();
      trackEventByName(tracks.clickAutotag.name);
      setIsAutotagMode(true);
    };

    const handleCloseAutotagView = (e: FormEvent) => {
      e.preventDefault();
      setIsAutotagMode(false);
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

    const navigate = (direction: 'up' | 'down') => {
      if (!isNilOrError(ideaList) && ideaList.length !== 0) {
        if (!highlightedId && !previewPostId) {
          setHighlightedId(ideaList[0].id);
        } else {
          const ideaIndex = ideaList.findIndex(
            (idea) => idea.id === highlightedId
          );

          let newIndex;
          if (direction === 'down') {
            newIndex = ideaIndex === ideaList.length - 1 ? 0 : ideaIndex + 1;
          }

          if (direction === 'up') {
            newIndex = ideaIndex === 0 ? ideaList.length - 1 : ideaIndex - 1;
          }

          setHighlightedId(ideaList[newIndex].id);

          if (previewPostId) {
            setPreviewPostId(ideaList[newIndex].id);
          }
        }
      }
    };

    const handleProjectIdsChange = (newProjectIds: string[]) => {
      const { onChangeProjects } = ideas as GetIdeasChildProps;
      setSelectedRows([]);
      setSelectedProjectIds(newProjectIds);
      if (newProjectIds.length > 0) {
        onChangeProjects(newProjectIds);
        setLoadingIdeas(true);
      } else {
        setIdeaList([]);
      }
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
      setHighlightedId(id);
    };

    const closeSideModal = () => setPreviewPostId(null);

    if (!isNilOrError(projectList) && !isNilOrError(locale) && !isAutotagMode)
      return (
        <Container className={className}>
          <CSSTransition
            in={!previewPostId}
            mountOnEnter={true}
            unmountOnExit={true}
            classNames="slide"
            timeout={{
              appear: 500,
              enter: 300,
              exit: 500,
            }}
          >
            <FilterSectionTransitionWrapper>
              <FilterSection>
                <StyledFilterSelector
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
                    disabled={selectedRows.length === 0}
                    processing={processing}
                    locale={locale}
                    onClick={handleAutoTag}
                  >
                    <FormattedMessage {...messages.autotag} />
                  </Button>

                  <Button
                    buttonStyle="admin-dark-outlined"
                    disabled={selectedRows.length === 0}
                    processing={exporting}
                    onClick={handleExportSelectedIdeasAsXlsx}
                    locale={locale}
                  >
                    <FormattedMessage {...messages.export} />
                  </Button>
                </StyledActions>
              </FilterSection>
            </FilterSectionTransitionWrapper>
          </CSSTransition>
          {!isNilOrError(ideaList) && !loadingIdeas && ideaList.length > 0 ? (
            <TableWrapper>
              <StyledTable>
                {!previewPostId && (
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
                            totalCount: ideaList.length,
                            selectedCount: selectedRows.length,
                          }}
                        />
                      </th>

                      <th className="tags">
                        <FormattedMessage {...messages.tags} />
                      </th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {ideaList.map((idea) => (
                    <ProcessingRow
                      key={idea.id}
                      idea={idea}
                      selected={includes(selectedRows, idea.id)}
                      highlighted={idea.id === highlightedId}
                      rowRef={idea.id === highlightedId ? rowRef : undefined}
                      showTagColumn={!previewPostId}
                      onSelect={handleRowOnSelect}
                      openPreview={openPreview}
                      tagSuggestions={null}
                    />
                  ))}
                </tbody>
              </StyledTable>
            </TableWrapper>
          ) : loadingIdeas ? (
            <StyledSpinner />
          ) : (
            <InformationBox>
              <FormattedMessage {...messages.pleaseSelectAProject} />
            </InformationBox>
          )}
          <CSSTransition
            in={!!previewPostId}
            mountOnEnter={true}
            unmountOnExit={true}
            classNames="slide"
            timeout={{
              appear: 500,
              enter: 300,
              exit: 500,
            }}
          >
            <PostPreviewTransitionWrapper>
              <PostPreview
                type={'AllIdeas'}
                postId={previewPostId}
                onClose={closeSideModal}
                handleNavigation={navigate}
              />
            </PostPreviewTransitionWrapper>
          </CSSTransition>
        </Container>
      );
    if (!isNilOrError(projectList) && !isNilOrError(locale) && isAutotagMode)
      return <AutotagView closeView={handleCloseAutotagView} />;
    else return null;
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
        projectIds={projectIds}
        cache={true}
      >
        {render}
      </GetIdeas>
    );
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
