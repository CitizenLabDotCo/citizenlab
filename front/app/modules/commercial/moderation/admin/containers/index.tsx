import React, { memo, useCallback, useState, useEffect } from 'react';

import { isNilOrError } from 'utils/helperUtils';
import { insertConfiguration } from 'utils/moduleUtils';
import { isFlagActive } from 'modules/commercial/flag_inappropriate_content/utils';

// components
import Table from 'components/UI/Table';
import ModerationRow from './ModerationRow';
import Pagination from 'components/admin/Pagination/Pagination';
import Checkbox from 'components/UI/Checkbox';
import { Icon, IconTooltip, Select } from 'cl2-component-library';
import Button from 'components/UI/Button';
import Tabs, { ITabItem } from 'components/UI/Tabs';
import { PageTitle } from 'components/admin/Section';
import SelectType from './SelectType';
import SelectProject from './SelectProject';
import SearchInput from 'components/UI/SearchInput';
import Outlet from 'components/Outlet';

// hooks
import useModerations from '../../hooks/useModerations';

// services
import {
  updateModerationStatus,
  IModerationData,
  TModeratableTypes,
} from '../../services/moderations';
import {
  removeInappropriateContentFlag,
  inappropriateContentFlagByIdStream,
  IInappropriateContentFlag,
} from 'modules/commercial/flag_inappropriate_content/services/inappropriateContentFlags';

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
  min-height: 50px;
  display: flex;
  align-items: center;
  margin-bottom: 55px;
`;

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

type TTabName = ITabNamesMap[keyof ITabNamesMap];

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

  const {
    list,
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
  } = useModerations({
    pageSize: pageSizes[1].value,
    moderationStatus: 'unread',
    moderatableTypes: [],
    projectIds: [],
    searchTerm: '',
  });

  const [moderationItems, setModerationItems] = useState(list);
  const [selectedModerations, setSelectedModerations] = useState<
    IModerationData[]
  >([]);
  const [processing, setProcessing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<TModeratableTypes[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<TTabName>('unread');
  const [
    activeInappropriateContentFlags,
    setActiveInappropriateContentFlags,
  ] = useState<IInappropriateContentFlag[]>([]);
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

  const handleOnSelectAll = useCallback(
    (_event: React.ChangeEvent) => {
      if (!isNilOrError(moderationItems) && !processing) {
        setSelectedModerations(
          selectedModerations.length < moderationItems.length
            ? moderationItems
            : []
        );
      }
    },
    [moderationItems, selectedModerations, processing]
  );

  const handleOnTabChange = useCallback(
    (tabName: TTabName) => {
      setSelectedTab(tabName);

      if (tabName === 'read' || tabName === 'unread') {
        onModerationStatusChange(tabName);
      }

      trackEventByName(tracks.tabClicked, {
        tabName,
      });
    },
    [onModerationStatusChange]
  );

  const handePageNumberChange = useCallback(
    (pageNumber: number) => {
      trackEventByName(tracks.pageNumberClicked);
      onPageNumberChange(pageNumber);
    },
    [onPageNumberChange]
  );

  const handleOnPageSizeChange = useCallback(
    (option: IOption) => {
      onPageSizeChange(option.value);
    },
    [onPageSizeChange]
  );

  const handleModeratableTypesChange = useCallback(
    (newSelectedTypes: TModeratableTypes[]) => {
      setSelectedTypes(newSelectedTypes);
      onModeratableTypesChange(newSelectedTypes);
      trackEventByName(tracks.typeFilterUsed);
    },
    [onModeratableTypesChange]
  );

  const handleProjectIdsChange = useCallback(
    (newProjectIds: string[]) => {
      setSelectedProjectIds(newProjectIds);
      onProjectIdsChange(newProjectIds);
      trackEventByName(tracks.projectFilterUsed);
    },
    [onModeratableTypesChange]
  );

  const handleSearchTermChange = useCallback(
    (searchTerm: string) => {
      onSearchTermChange(searchTerm);
      trackEventByName(tracks.searchUsed, {
        searchTerm,
      });
    },
    [onSearchTermChange]
  );

  const isModerationSelected = (selectedModeration: IModerationData) =>
    selectedModerations
      .map((moderation) => moderation.id)
      .includes(selectedModeration.id);

  const handleRowOnSelect = useCallback(
    (newSelectedModeration: IModerationData) => {
      if (!processing) {
        setSelectedModerations(
          isModerationSelected(newSelectedModeration)
            ? selectedModerations.filter(
                (moderation) => moderation.id !== newSelectedModeration.id
              )
            : [...selectedModerations, newSelectedModeration]
        );
      }
    },
    [processing]
  );

  const removeFlags = useCallback(async () => {
    if (activeInappropriateContentFlags.length > 0 && !processing) {
      const promises = activeInappropriateContentFlags.map((flag) => {
        const flagId = flag.data.id;
        return removeInappropriateContentFlag(flagId);
      });

      setProcessing(true);
      await Promise.all(promises);
      setProcessing(false);
      setSelectedModerations([]);
    }
  }, [activeInappropriateContentFlags, processing]);

  const markAs = useCallback(
    async (event: React.FormEvent) => {
      if (
        selectedModerations.length > 0 &&
        !isNilOrError(moderationItems) &&
        moderationStatus &&
        !processing
      ) {
        event.preventDefault();
        trackEventByName(
          moderationStatus === 'read'
            ? tracks.markedAsNotViewedButtonClicked
            : tracks.markedAsNotViewedButtonClicked,
          { selectedItemsCount: selectedModerations.length }
        );
        setProcessing(true);
        const updatedModerationStatus =
          moderationStatus === 'read' ? 'unread' : 'read';
        const promises = selectedModerations.map((moderation) =>
          updateModerationStatus(
            moderation.id,
            moderation.attributes.moderatable_type,
            updatedModerationStatus
          )
        );
        await Promise.all(promises);
        setProcessing(false);
        setSelectedModerations([]);
      }
    },
    [selectedModerations, moderationItems, moderationStatus]
  );

  const handleData = (data: InsertConfigurationOptions<ITabItem>) =>
    setTabs((tabs) => insertConfiguration(data)(tabs));

  useEffect(() => {
    if (!processing) {
      setSelectedModerations([]);
    }
  }, [currentPage, moderationStatus, pageSize, processing]);

  useEffect(() => {
    if (!processing) {
      setModerationItems(list);
    }
  }, [list, processing]);

  useEffect(() => {
    (async () => {
      if (selectedModerations.length > 0) {
        const selectedModerationsWithFlagRelationship = selectedModerations.filter(
          (moderation) =>
            moderation.relationships.inappropriate_content_flag?.data.id
        );
        const promises = selectedModerationsWithFlagRelationship.map(
          (moderationItemWithFlag) =>
            inappropriateContentFlagByIdStream(
              moderationItemWithFlag.id
            ).fetch()
        ) as Promise<IInappropriateContentFlag>[];
        const flags = await Promise.all(promises);
        const activeFlags = flags.filter((flag) => isFlagActive(flag.data));
        setActiveInappropriateContentFlags(activeFlags);
      }
    })();
  }, [selectedModerations]);

  if (!isNilOrError(moderationItems)) {
    return (
      <Container className={className}>
        <PageTitleWrapper>
          <StyledPageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </StyledPageTitle>
          <StyledIconTooltip
            content={<FormattedMessage {...messages.moderationHelpTooltip} />}
            iconSize="20px"
            placement="right"
          />
        </PageTitleWrapper>

        <ActionBar>
          {selectedModerations.length === 0 ? (
            <>
              <Outlet
                id="app.modules.commercial.moderation.admin.containers.tabs"
                onData={handleData}
              />
              <StyledTabs
                items={tabs}
                selectedValue={selectedTab}
                onClick={handleOnTabChange}
              />
              <SelectType
                selectedTypes={selectedTypes}
                onChange={handleModeratableTypesChange}
              />
              <SelectProject
                selectedProjectIds={selectedProjectIds}
                onChange={handleProjectIdsChange}
              />
            </>
          ) : (
            <Buttons>
              {selectedModerations.length > 0 && (
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
                  {moderationStatus === 'unread' ? (
                    <FormattedMessage {...messages.markAsSeen} />
                  ) : (
                    <FormattedMessage {...messages.markAsNotSeen} />
                  )}
                </MarkAsButton>
              )}

              <Outlet
                id="app.modules.commercial.moderation.admin.containers.actionbar.buttons"
                activeFlagsCount={activeInappropriateContentFlags.length}
                processing={processing}
                onClick={removeFlags}
              />
            </Buttons>
          )}
          <StyledSearchInput onChange={handleSearchTermChange} />
        </ActionBar>

        <StyledTable>
          <thead>
            <tr>
              <th className="checkbox">
                <StyledCheckbox
                  checked={
                    moderationItems.length > 0 &&
                    selectedModerations.length === moderationItems.length
                  }
                  indeterminate={
                    selectedModerations.length > 0 &&
                    selectedModerations.length < moderationItems.length
                  }
                  disabled={moderationItems.length === 0}
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
          {moderationItems.length > 0 && (
            <tbody>
              {moderationItems.map((moderationItem) => (
                <ModerationRow
                  key={moderationItem.id}
                  moderation={moderationItem}
                  selected={isModerationSelected(moderationItem)}
                  onSelect={handleRowOnSelect}
                  inappropriateContentFlagId={
                    moderationItem.relationships.inappropriate_content_flag
                      ?.data.id
                  }
                />
              ))}
            </tbody>
          )}
        </StyledTable>

        {moderationItems.length > 0 && (
          <Footer>
            <StyledPagination
              currentPage={currentPage}
              totalPages={lastPage}
              loadPage={handePageNumberChange}
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

        {moderationItems.length === 0 && (
          <Empty>
            <EmptyIcon name="inbox" />
            <EmptyMessage>
              {moderationStatus === 'read' ? (
                <FormattedMessage {...messages.noViewedItems} />
              ) : (
                <FormattedMessage {...messages.noUnviewedItems} />
              )}
            </EmptyMessage>
          </Empty>
        )}
      </Container>
    );
  }

  return null;
});

export default injectIntl(Moderation);
