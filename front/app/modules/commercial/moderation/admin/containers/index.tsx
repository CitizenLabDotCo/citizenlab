import React, { memo, useState, useEffect, useCallback } from 'react';

import { isNilOrError } from 'utils/helperUtils';
import { insertConfiguration } from 'utils/moduleUtils';

// components
import Table from 'components/UI/Table';
import ModerationRow from './ModerationRow';
import Pagination from 'components/Pagination';
import Checkbox from 'components/UI/Checkbox';
import { Icon, IconTooltip, Select, Error } from 'cl2-component-library';
import Button from 'components/UI/Button';
import Tabs, { ITabItem } from 'components/UI/Tabs';
import { PageTitle } from 'components/admin/Section';
import SelectType from './SelectType';
import SelectProject from './SelectProject';
import SearchInput from 'components/UI/SearchInput';
import Outlet from 'components/Outlet';

// hooks
import useModerations from '../../hooks/useModerations';
import useModerationsCount from '../../hooks/useModerationsCount';

// services
import {
  updateModerationStatus,
  IModerationData,
  TModeratableType,
} from '../../services/moderations';
import { removeInappropriateContentFlag } from 'modules/commercial/flag_inappropriate_content/services/inappropriateContentFlags';

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
import { IOption, InsertConfigurationOptions } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 80px;
`;

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 40px;
`;

const StyledPageTitle = styled(PageTitle)`
  line-height: ${fontSizes.xxxl}px;
  margin-bottom: 0px;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 8px;
  margin-bottom: 3px;
`;

const ActionBar = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 55px;
`;

const ActionBarTop = styled.div`
  min-height: 50px;
  display: flex;
  align-items: center;
`;

const ActionBarBottom = styled.div``;

const Buttons = styled.div`
  display: flex;
`;

const MarkAsButton = styled(Button)`
  margin-right: 20px;
`;

const StyledTabs = styled(Tabs)`
  margin-right: 20px;
`;

const StyledTable = styled(Table)`
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
  margin-top: -3px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
`;

const StyledPagination = styled(Pagination)`
  margin-left: -12px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const RowsPerPage = styled.div`
  display: flex;
  align-items: center;
`;

const RowsPerPageLabel = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin-right: 10px;
`;

const PageSizeSelect = styled(Select)`
  select {
    padding-top: 8px;
    padding-bottom: 8px;
  }
`;

const Empty = styled.div`
  height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EmptyIcon = styled(Icon)`
  height: 60px;
  fill: #bfe7eb;
  margin-bottom: 18px;
`;

const EmptyMessage = styled.div`
  max-width: 350px;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.medium}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
`;

const StyledSearchInput = styled(SearchInput)`
  margin-left: auto;
  width: 320px;
`;

interface Props {
  className?: string;
}

export interface ITabNamesMap {
  read: 'read';
  unread: 'unread';
}

export type TActivityTabName = ITabNamesMap[keyof ITabNamesMap];

const Moderation = memo<Props & InjectedIntlProps>(({ className, intl }) => {
  const pageSizes = [
    {
      value: 10,
      label: '10',
    },
    {
      value: 25,
      label: '25',
    },
    {
      value: 50,
      label: '50',
    },
    {
      value: 100,
      label: '100',
    },
  ];

  const [selectedModerations, setSelectedModerations] = useState<
    IModerationData[]
  >([]);
  const [processing, setProcessing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<TModeratableType[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(1);
  const [selectedPageSize, setSelectedPageSize] = useState<number>(
    pageSizes[1].value
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<TActivityTabName>('unread');
  const [actionBarErrorMessage, setActionBarErrorMessage] = useState<
    string | null
  >(null);
  const [tabs, setTabs] = useState<ITabItem[]>([
    {
      name: 'unread',
      label: intl.formatMessage(messages.unread),
    },
    {
      name: 'read',
      label: intl.formatMessage(messages.read),
    },
  ]);

  const {
    list: moderations,
    pageSize,
    moderationStatus,
    currentPage,
    lastPage,
    onModerationStatusChange,
    onPageNumberChange,
    onPageSizeChange,
    onModeratableTypesChange,
    onProjectIdsChange,
    onSearchTermChange,
    onIsFlaggedChange,
  } = useModerations({
    pageSize: selectedPageSize,
    moderationStatus: 'unread',
  });
  const moderationsWithActiveFlagCount = useModerationsCount({
    isFlagged: true,
  });

  const handleOnSelectAll = (_event: React.ChangeEvent) => {
    if (!processing && !isNilOrError(moderations)) {
      setSelectedModerations(
        selectedModerations.length < moderations.length ? moderations : []
      );
    }
  };

  const handleOnTabChange = (tabName: TActivityTabName) => {
    setSelectedTab(tabName);
    trackEventByName(tracks.tabClicked, {
      tabName,
    });
  };

  useEffect(() => {
    if (selectedTab === 'read' || selectedTab === 'unread') {
      onIsFlaggedChange(false);
      onModerationStatusChange(selectedTab);
    }

    // OS: how to?
    if (selectedTab === 'warnings') {
      onIsFlaggedChange(true);
      onModerationStatusChange(null);
    }
  }, [selectedTab, onIsFlaggedChange, onModerationStatusChange]);

  const handleOnPageNumberChange = (pageNumber: number) => {
    trackEventByName(tracks.pageNumberClicked);
    setSelectedPageNumber(pageNumber);
  };

  useEffect(() => {
    onPageNumberChange(selectedPageNumber);
  }, [selectedPageNumber, onPageNumberChange]);

  const handleOnPageSizeChange = (option: IOption) => {
    setSelectedPageSize(option.value);
  };

  useEffect(() => {
    onPageSizeChange(selectedPageSize);
  }, [selectedPageSize, onPageSizeChange]);

  const handleOnModeratableTypesChange = (
    newSelectedTypes: TModeratableType[]
  ) => {
    setSelectedTypes(newSelectedTypes);
    trackEventByName(tracks.typeFilterUsed);
  };

  useEffect(() => {
    onModeratableTypesChange(selectedTypes);
  }, [selectedTypes, onModeratableTypesChange]);

  const handleOnProjectIdsChange = (newProjectIds: string[]) => {
    setSelectedProjectIds(newProjectIds);
    trackEventByName(tracks.projectFilterUsed);
  };

  useEffect(() => {
    onProjectIdsChange(selectedProjectIds);
  }, [selectedProjectIds, onProjectIdsChange]);

  const handleSearchTermChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    trackEventByName(tracks.searchUsed, {
      searchTerm,
    });
  };

  useEffect(() => {
    onSearchTermChange(searchTerm);
  }, [searchTerm, onSearchTermChange]);

  const isModerationSelected = (
    selectedModeration: IModerationData,
    selectedModerations: IModerationData[]
  ) =>
    selectedModerations
      .map((moderation) => moderation.id)
      .includes(selectedModeration.id);

  const handleRowOnSelectChange = (newSelectedModeration: IModerationData) => {
    if (!processing) {
      setSelectedModerations((prevSelectedModerations) => {
        if (
          isModerationSelected(newSelectedModeration, prevSelectedModerations)
        ) {
          return prevSelectedModerations.filter(
            (moderation) => moderation.id !== newSelectedModeration.id
          );
        }

        return [...prevSelectedModerations, newSelectedModeration];
      });
    }
  };

  // OS: how to?
  const removeFlags = async () => {
    if (!processing) {
      const selectedActiveInappropriateContentFlagIds = selectedModerations.map(
        // we can be sure the flag is here. With the is_flagged param in the request
        // only moderations with active flags will be returned
        (mod) => mod.relationships.inappropriate_content_flag?.data.id as string
      );

      const promises = selectedActiveInappropriateContentFlagIds.map(
        (flagId) => {
          return removeInappropriateContentFlag(flagId);
        }
      );

      try {
        setActionBarErrorMessage(null);
        setProcessing(true);

        await Promise.all(promises);

        setProcessing(false);
        setSelectedModerations([]);
      } catch {
        setActionBarErrorMessage(intl.formatMessage(messages.removeFlagsError));
        setProcessing(false);
      }
    }
  };

  const markAs = async (event: React.FormEvent) => {
    if (selectedModerations.length > 0 && moderationStatus && !processing) {
      event.preventDefault();
      const updatedModerationStatus =
        moderationStatus === 'read' ? 'unread' : 'read';
      const promises = selectedModerations.map((moderation) =>
        updateModerationStatus(
          moderation.id,
          moderation.attributes.moderatable_type,
          updatedModerationStatus
        )
      );

      try {
        setActionBarErrorMessage(null);
        setProcessing(true);

        await Promise.all(promises);

        setProcessing(false);
        setSelectedModerations([]);

        trackEventByName(
          moderationStatus === 'read'
            ? tracks.markedAsNotViewedButtonClicked
            : tracks.markedAsNotViewedButtonClicked,
          { selectedItemsCount: selectedModerations.length }
        );
      } catch {
        setActionBarErrorMessage(intl.formatMessage(messages.markFlagsError));
        setProcessing(false);
      }
    }
  };

  const handleData = useCallback(
    (data: InsertConfigurationOptions<ITabItem>) =>
      setTabs((tabs) => insertConfiguration(data)(tabs)),
    []
  );

  useEffect(() => {
    if (!processing) {
      setSelectedModerations([]);
    }
  }, [currentPage, moderationStatus, pageSize, processing]);

  if (!isNilOrError(moderations)) {
    return (
      <Container className={className}>
        <PageTitleWrapper>
          <StyledPageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </StyledPageTitle>
          <StyledIconTooltip
            content={<FormattedMessage {...messages.moderationsTooltip} />}
            iconSize="20px"
            placement="right"
          />
        </PageTitleWrapper>

        <ActionBar>
          <ActionBarTop>
            {selectedModerations.length === 0 ? (
              <>
                <Outlet
                  id="app.modules.commercial.moderation.admin.containers.tabs"
                  onData={handleData}
                  activeFlagsCount={
                    !isNilOrError(moderationsWithActiveFlagCount)
                      ? moderationsWithActiveFlagCount.count
                      : 0
                  }
                />
                <StyledTabs
                  items={tabs}
                  selectedValue={selectedTab}
                  onClick={handleOnTabChange}
                />
                <SelectType
                  selectedTypes={selectedTypes}
                  onChange={handleOnModeratableTypesChange}
                />
                <SelectProject
                  selectedProjectIds={selectedProjectIds}
                  onChange={handleOnProjectIdsChange}
                />
              </>
            ) : (
              <Buttons>
                {selectedModerations.length > 0 &&
                  (selectedTab === 'read' || selectedTab === 'unread') && (
                    <MarkAsButton
                      icon={
                        moderationStatus === 'unread'
                          ? 'eyeOpened-unfilled'
                          : 'eyeClosed-unfilled'
                      }
                      buttonStyle="cl-blue"
                      processing={processing}
                      onClick={markAs}
                    >
                      {intl.formatMessage(
                        {
                          unread: messages.markSeen,
                          read: messages.markNotSeen,
                        }[selectedTab],
                        {
                          selectedItemsCount: selectedModerations.length,
                        }
                      )}
                    </MarkAsButton>
                  )}

                <Outlet
                  id="app.modules.commercial.moderation.admin.containers.actionbar.buttons"
                  selectedActiveFlagsCount={selectedModerations.length}
                  processing={processing}
                  onRemoveFlags={removeFlags}
                  isWarningsTabSelected={selectedTab === 'warnings'}
                />
              </Buttons>
            )}
            <StyledSearchInput onChange={handleSearchTermChange} />
          </ActionBarTop>
          <ActionBarBottom>
            <Error text={actionBarErrorMessage} />
          </ActionBarBottom>
        </ActionBar>

        <StyledTable>
          <thead>
            <tr>
              <th className="checkbox">
                <StyledCheckbox
                  checked={
                    moderations.length > 0 &&
                    selectedModerations.length === moderations.length
                  }
                  indeterminate={
                    selectedModerations.length > 0 &&
                    selectedModerations.length < moderations.length
                  }
                  disabled={moderations.length === 0}
                  onChange={handleOnSelectAll}
                />
              </th>
              <th className="date">
                <FormattedMessage {...messages.date} />
              </th>
              <th className="type">
                <FormattedMessage {...messages.type} />
              </th>
              <th className="belongsTo">
                <FormattedMessage {...messages.belongsTo} />
              </th>
              <th className="content">
                <FormattedMessage {...messages.content} />
              </th>
              <th className="goto">&nbsp;</th>
            </tr>
          </thead>
          {moderations.length > 0 && (
            <tbody>
              {moderations.map((moderationItem) => (
                <ModerationRow
                  key={moderationItem.id}
                  moderation={moderationItem}
                  selected={isModerationSelected(
                    moderationItem,
                    selectedModerations
                  )}
                  onSelect={handleRowOnSelectChange}
                  inappropriateContentFlagId={
                    moderationItem.relationships.inappropriate_content_flag
                      ?.data.id
                  }
                />
              ))}
            </tbody>
          )}
        </StyledTable>

        {moderations.length > 0 && (
          <Footer>
            <StyledPagination
              currentPage={currentPage}
              totalPages={lastPage}
              loadPage={handleOnPageNumberChange}
            />

            <Spacer />

            <RowsPerPage>
              <RowsPerPageLabel>
                <FormattedMessage {...messages.rowsPerPage} />:
              </RowsPerPageLabel>
              <PageSizeSelect
                options={pageSizes}
                onChange={handleOnPageSizeChange}
                value={pageSizes.find((item) => item.value === pageSize)}
              />
            </RowsPerPage>
          </Footer>
        )}

        {moderations.length === 0 && (
          <Empty>
            <EmptyIcon name="inbox" />
            <EmptyMessage>
              {
                {
                  read: <FormattedMessage {...messages.noViewedItems} />,
                  unread: <FormattedMessage {...messages.noUnviewedItems} />,
                }[selectedTab]
              }
              <Outlet
                id="app.modules.commercial.moderation.admin.components.EmptyMessage"
                isWarningsTabSelected={selectedTab === 'warnings'}
              />
            </EmptyMessage>
          </Empty>
        )}
      </Container>
    );
  }

  return null;
});

export default injectIntl(Moderation);
