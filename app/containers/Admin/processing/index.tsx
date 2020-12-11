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
import Modal from 'components/UI/Modal';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';

// styling
import styled from 'styled-components';
import { stylingConsts, colors } from 'utils/styleUtils';

// typings
import { adopt } from 'react-adopt';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { IIdeaData } from 'services/ideas';
import { ITagging } from 'services/taggings';

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
import useTags from 'hooks/useTags';
import useTaggings from 'hooks/useTaggings';
import Tippy from '@tippyjs/react';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import FeatureFlag from 'components/FeatureFlag';

const Container = styled.div`
  height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

const StyledSpinner = styled(Spinner)`
  margin: auto;
`;

const StyledModal = styled(Modal)`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  > * {
    margin-left: 12px;
  }
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
    transform: translateX(-400%);

    &.slide-enter-active {
      transition: 1000ms;
      transform: translateX(0%);
    }
  }

  &.slide-exit {
    transition: 1000ms;
    transform: translateX(0%);

    &.slide-exit-active {
      transform: translateX(-400%);
    }
  }
`;

const LeftPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 36px 18px;
  position: sticky;
  top: ${stylingConsts.menuHeight}px;
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  max-width: 150px;
  z-index: 100;
  background-color: #f9f9fa;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
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
  margin-bottom: 15px;
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
    min-width: 100px;

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

const KeyboardShortcuts = styled.div`
  height: auto;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.clBlueDarkBg};
  font-size: ${fontSizes.xs}px;
`;
interface DataProps {
  ideas: GetIdeasChildProps;
  projects: GetProjectsChildProps;
}

interface InputProps {
  className?: string;
}

interface Props extends InputProps, DataProps {}

const projectMessage = <FormattedMessage {...messages.selectProject} />;
const cancelMessage = <FormattedMessage {...messages.cancel} />;
const continueMessage = <FormattedMessage {...messages.continue} />;
const Processing = memo<Props & InjectedIntlProps>(
  ({ className, ideas, projects }) => {
    const localize = useLocalize();
    const tenant = useTenant();
    const locale = useLocale();

    const [ideaList, setIdeaList] = useState<IIdeaData[] | undefined | null>(
      undefined
    );
    const [projectList, setProjectList] = useState<
      IFilterSelectorValue[] | null
    >(null);

    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const { taggings } = useTaggings();
    const { tags, onProjectsChange } = useTags();

    const [exporting, setExporting] = useState<boolean>(false);

    const [loadingIdeas, setLoadingIdeas] = useState<boolean>(false);
    const [previewPostId, setPreviewPostId] = useState<string | null>(null);
    const [showAutotagView, setShowAutotagView] = useState<boolean>(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(
      false
    );

    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

    const upArrow = useKeyPress('ArrowUp');
    const downArrow = useKeyPress('ArrowDown');
    const enterTaggingViewKey = useKeyPress('Enter');
    const exitTaggingViewKey = useKeyPress('Escape');

    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (highlightedId && !isNilOrError(rowRef) && rowRef.current) {
        rowRef.current.scrollIntoView(false);
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

        onProjectsChange([projects.projectsList[0].id]);
      }
    }, [projects, tenant, locale]);

    useEffect(() => {
      if (upArrow) {
        trackEventByName('Keyboard shorcut', { key: 'up' });
        navigate('up');
      }
    }, [upArrow, ideaList]);

    useEffect(() => {
      if (downArrow) {
        trackEventByName('Keyboard shorcut', { key: 'down' });
        navigate('down');
      }
    }, [downArrow, ideaList]);

    useEffect(() => {
      if (
        enterTaggingViewKey &&
        !isNilOrError(ideaList) &&
        ideaList.length > 0
      ) {
        trackEventByName('Keyboard shorcut', { key: 'enter' });
        if (!highlightedId) {
          setHighlightedId(ideaList[0].id);
          setPreviewPostId(ideaList[0].id);
        } else {
          setPreviewPostId(highlightedId);
        }
      }
    }, [enterTaggingViewKey, ideaList]);

    useEffect(() => {
      if (exitTaggingViewKey && ideaList) {
        trackEventByName('Keyboard shorcut', { key: 'escape' });
        setPreviewPostId(null);
      }
    }, [exitTaggingViewKey, ideaList]);

    useEffect(() => {
      if (!isNilOrError(ideas.list) && ideas.list.length > 0) {
        setIdeaList(ideas.list);
      }
      setLoadingIdeas(false);
    }, [ideas]);

    useEffect(() => {
      if (!isNilOrError(ideaList) && ideaList.length > 0) {
        setHighlightedId(ideaList[0].id);
      }
      if (loadingIdeas) {
        setLoadingIdeas(false);
      }
    }, [ideaList]);

    const handleExportSelectedIdeasAsXlsx = async () => {
      trackEventByName('Filter View', { action: 'Clicked Export Button' });
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
      trackEventByName('Filter View', { action: 'Clicked Autotag Button' });
      isAutotagLeftInSelection()
        ? setConfirmationModalOpen(true)
        : setShowAutotagView(true);
    };

    const handleCloseAutotagView = (e?: FormEvent) => {
      e?.preventDefault();
      trackEventByName('Autotag View', { action: 'go back' });
      setShowAutotagView(false);
    };

    const handleConfirmAutotag = (e?: FormEvent) => {
      e?.preventDefault();
      trackEventByName('Autotag Confirmation Modal', { action: 'continue' });
      setConfirmationModalOpen(false);
      setShowAutotagView(true);
    };

    const handleCloseConfirmationModal = (e?: FormEvent) => {
      e?.preventDefault();
      trackEventByName('Autotag Confirmation Modal', { action: 'cancel' });
      setConfirmationModalOpen(false);
    };

    const handleOnSelectAll = useCallback(
      (_event: React.ChangeEvent) => {
        if (!isNilOrError(ideaList)) {
          const newSelectedRows =
            selectedRows.length < ideaList.length
              ? ideaList.map((item) => item.id)
              : [];
          trackEventByName('Idea Table', {
            action: 'clicked on "select all ideas" checkbox',
            context: `${previewPostId ? 'tagging view' : 'filter view'}`,
          });
          setSelectedRows(newSelectedRows);
        }
      },
      [ideaList, selectedRows]
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

    const handleProjectIdsChange = useCallback(
      (newProjectIds: string[]) => {
        const { onChangeProjects } = ideas;
        setSelectedRows([]);
        setSelectedProjectIds(newProjectIds);
        onChangeProjects(newProjectIds);
        setLoadingIdeas(true);
        trackEventByName('Filter View', {
          action: 'changed projects',
        });
      },
      [ideas]
    );

    const areSomeIdeaTagsAutomatic = (ideaTaggings: ITagging[]) =>
      ideaTaggings.some(
        (ideaTagging) =>
          ideaTagging.attributes.assignment_method === 'automatic'
      );

    const isAutotagLeftInSelection = () => {
      return selectedRows.some((ideaId) => {
        const ideaTaggings = getIdeaTaggings(ideaId);
        return areSomeIdeaTagsAutomatic(ideaTaggings);
      });
    };

    const handleRowOnSelect = useCallback((selectedItemId: string) => {
      setSelectedRows((selectedRows) => {
        const newSelectedRows = includes(selectedRows, selectedItemId)
          ? selectedRows.filter((id) => id !== selectedItemId)
          : selectedRows.concat(selectedItemId);
        return newSelectedRows;
      });
    }, []);

    const openPreview = useCallback((id: string) => {
      setPreviewPostId(id);
      setHighlightedId(id);
    }, []);

    const closeSideModal = () => setPreviewPostId(null);

    const getIdeaTaggings = (id: string | null) => {
      if (!isNilOrError(taggings)) {
        return taggings.filter((tagging) => tagging.attributes.idea_id === id);
      }

      return [];
    };

    if (
      !isNilOrError(projectList) &&
      !isNilOrError(locale) &&
      !showAutotagView
    ) {
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
              <LeftPanelContainer>
                <FilterSection>
                  <StyledFilterSelector
                    title={projectMessage}
                    name={'Projects'}
                    values={projectList}
                    onChange={handleProjectIdsChange}
                    multipleSelectionAllowed={false}
                    selected={selectedProjectIds}
                  />

                  <StyledActions>
                    <FeatureFlag name="automatic_tagging">
                      <Button
                        buttonStyle="admin-dark"
                        disabled={selectedRows.length === 0}
                        locale={locale}
                        onClick={handleAutoTag}
                      >
                        <FormattedMessage {...messages.autotag} />
                      </Button>
                    </FeatureFlag>

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
                <Tippy
                  placement="top"
                  content={
                    <ul>
                      <li>
                        <FormattedMessage {...messages.upAndDownArrow} />
                      </li>
                      <li>
                        <FormattedMessage {...messages.returnKey} />
                      </li>
                      <li>
                        <FormattedMessage {...messages.escapeKey} />
                      </li>
                    </ul>
                  }
                  theme="light"
                  hideOnClick={true}
                >
                  <KeyboardShortcuts>
                    <FormattedMessage {...messages.keyboardShortcuts} />
                  </KeyboardShortcuts>
                </Tippy>
              </LeftPanelContainer>
            </FilterSectionTransitionWrapper>
          </CSSTransition>
          {!isNilOrError(ideaList) &&
          !loadingIdeas &&
          ideaList.length > 0 &&
          !isNilOrError(taggings) ? (
            <TableWrapper>
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
                          totalCount: ideaList.length,
                          selectedCount: selectedRows.length,
                        }}
                      />
                    </th>

                    {!previewPostId && (
                      <th className="tags">
                        <FormattedMessage {...messages.tags} />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ideaList.map((idea) => (
                    <ProcessingRow
                      key={idea.id}
                      idea={idea}
                      selected={includes(selectedRows, idea.id)}
                      highlighted={idea.id === highlightedId}
                      rowRef={idea.id === highlightedId ? rowRef : undefined}
                      onSelect={handleRowOnSelect}
                      openPreview={openPreview}
                      taggings={taggings}
                      showTagColumn={!previewPostId}
                    />
                  ))}
                </tbody>
              </StyledTable>
            </TableWrapper>
          ) : (
            ideaList === undefined || (loadingIdeas && <StyledSpinner />)
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
                taggings={getIdeaTaggings(previewPostId)}
                tags={tags}
              />
            </PostPreviewTransitionWrapper>
          </CSSTransition>
          <StyledModal
            opened={confirmationModalOpen}
            close={handleCloseConfirmationModal}
          >
            <QuillEditedContent textColor={colors.adminTextColor}>
              <h2>
                <FormattedMessage {...messages.autotagOverwriteAlert} />
              </h2>
              <h4>
                <FormattedMessage {...messages.autotagOverwriteExplanation} />
              </h4>
              <ButtonRow>
                <Button
                  locale={locale}
                  buttonStyle="admin-dark-outlined"
                  onClick={handleCloseConfirmationModal}
                  text={cancelMessage}
                />
                <Button
                  locale={locale}
                  buttonStyle="admin-dark"
                  onClick={handleConfirmAutotag}
                  text={continueMessage}
                />
              </ButtonRow>
            </QuillEditedContent>
          </StyledModal>
        </Container>
      );
    }
    if (
      !isNilOrError(projectList) &&
      !isNilOrError(locale) &&
      showAutotagView
    ) {
      if (selectedRows.length > 500) {
        return (
          <AutotagView
            closeView={handleCloseAutotagView}
            selectedProjectIds={selectedProjectIds}
          />
        );
      }
      return (
        <AutotagView
          closeView={handleCloseAutotagView}
          selectedRows={selectedRows}
        />
      );
    } else return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  projects: ({ render }) => {
    return (
      <GetProjects
        publicationStatuses={['published', 'archived']}
        filterCanModerate={true}
        sort="new"
      >
        {render}
      </GetProjects>
    );
  },
  ideas: ({ render, projects }) => {
    if (isNilOrError(projects)) {
      return <>{render}</>;
    }
    return (
      <GetIdeas
        type="paginated"
        pageSize={200000}
        projectIds={[projects?.projectsList?.[0]?.id || '']}
        cache={false}
        mini={true}
        sort="new"
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
