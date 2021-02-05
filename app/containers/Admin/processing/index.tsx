import React, { memo, useState, useEffect, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import { reportError } from 'utils/loggingUtils';
import { saveAs } from 'file-saver';

// components
import AutotagView from './AutotagView';
import { fontSizes, Spinner, Button } from 'cl2-component-library';
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

// hooks & res
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';
import useLocalize from 'hooks/useLocalize';
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import { CSSTransition } from 'react-transition-group';
import useTags from 'hooks/useTags';
import Tippy from '@tippyjs/react';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import FeatureFlag from 'components/FeatureFlag';
import IdeasTable from './IdeasTable';
import useTaggings from 'hooks/useTaggings';
import EmptyState from './EmptyState';
import { cancelGenerate } from 'services/taggings';
import usePendingTasks from 'hooks/usePendingTasks';

const Container = styled.div`
  height: calc(100vh - ${(props) => props.theme.menuHeight}px);
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

const KeyboardShortcuts = styled.div`
  height: auto;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.clBlueDarkBg};
  font-size: ${fontSizes.xs}px;
`;

export const WarningTitle = styled.h2`
  font-size: ${fontSizes.large}px !important;
  margin-right: 20px !important;
`;
export const WarningMessage = styled.div`
  margin-bottom: 20px !important;
`;

interface DataProps {
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
  ({ className, projects }) => {
    const localize = useLocalize();
    const tenant = useTenant();
    const locale = useLocale();

    const { tags, onProjectsChange: changeTagsProjectFilter } = useTags();

    const { taggings } = useTaggings();

    const [projectList, setProjectList] = useState<
      IFilterSelectorValue[] | null
    >(null);

    const [exporting, setExporting] = useState<boolean>(false);

    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

    const {
      processing,
      unprocessedItemsIds,
      processingRemainingItemsCount,
    } = usePendingTasks();

    const [showAutotagView, setShowAutotagView] = useState<boolean>(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(
      false
    );

    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [previewPostId, setPreviewPostId] = useState<string | null>(null);

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

    const handleExportSelectedIdeasAsXlsx = async () => {
      trackEventByName('Filter View', { action: 'Clicked Export Button' });
      try {
        setExporting(true);
        const blob = await requestBlob(
          `${API_PATH}/ideas/as_xlsx_with_tags`,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          { ideas: selectedRows }
        );
        saveAs(blob, 'inputs-export.xlsx');

        setExporting(false);
      } catch (error) {
        reportError(error);
        setExporting(false);
      }
    };

    const getIdeaTaggings = (id: string | null) => {
      if (!isNilOrError(taggings)) {
        return taggings.filter((tagging) => tagging.attributes.idea_id === id);
      }

      return [];
    };

    const handleAutoTag = (e: FormEvent) => {
      e.preventDefault();
      trackEventByName('Filter View', { action: 'Clicked Autotag Button' });
      selectedRows.some((ideaId) =>
        getIdeaTaggings(ideaId).some(
          (tagging) => tagging.attributes.assignment_method === 'automatic'
        )
      )
        ? setConfirmationModalOpen(true)
        : setShowAutotagView(true);
    };
    const handleCancelAutoTag = (e: FormEvent) => {
      e.preventDefault();
      trackEventByName('Filter View', {
        action: 'Clicked Cancel Autotag Button',
      });
      cancelGenerate();
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

    const handleProjectIdsChange = (newProjectIds: string[]) => {
      setSelectedRows([]);
      setSelectedProjectIds(newProjectIds);
      changeTagsProjectFilter(newProjectIds);
      trackEventByName('Filter View', {
        action: 'changed projects',
      });
    };

    if (
      projectList === undefined ||
      locale === undefined ||
      tags === undefined
    ) {
      return <StyledSpinner />;
    }

    if (
      isNilOrError(projectList) ||
      isNilOrError(locale) ||
      isNilOrError(tags)
    ) {
      return null;
    }

    if (!showAutotagView) {
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
                      {!processing ? (
                        <Button
                          buttonStyle="admin-dark"
                          disabled={selectedRows.length === 0}
                          locale={locale}
                          onClick={handleAutoTag}
                        >
                          <FormattedMessage {...messages.autotag} />
                        </Button>
                      ) : (
                        <>
                          <div>
                            <FormattedMessage
                              {...messages.autotaggingProcessing}
                              values={{
                                remainingItems: processingRemainingItemsCount,
                              }}
                            />
                          </div>
                          <Button
                            locale={locale}
                            buttonStyle="admin-dark"
                            onClick={handleCancelAutoTag}
                          >
                            <FormattedMessage {...messages.cancel} />
                          </Button>
                        </>
                      )}
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
          {selectedProjectIds.length > 0 ? (
            <IdeasTable
              projectFilterIds={selectedProjectIds}
              previewPostId={previewPostId}
              setPreviewPostId={setPreviewPostId}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              tags={tags}
              taggings={taggings}
              unprocessedItemsIds={unprocessedItemsIds}
            />
          ) : (
            <EmptyState reason="projectSelection" />
          )}
          <StyledModal
            opened={confirmationModalOpen}
            close={handleCloseConfirmationModal}
          >
            <QuillEditedContent textColor={colors.adminTextColor}>
              <WarningTitle>
                <FormattedMessage {...messages.autotagOverwriteAlert} />
              </WarningTitle>
              <WarningMessage>
                <FormattedMessage {...messages.autotagOverwriteExplanation} />
              </WarningMessage>
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
    if (showAutotagView) {
      if (selectedRows.length > 100) {
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
        publicationStatuses={['published', 'archived', 'draft']}
        filterCanModerate={true}
        sort="new"
      >
        {render}
      </GetProjects>
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
