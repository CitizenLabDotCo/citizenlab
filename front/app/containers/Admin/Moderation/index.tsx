import React, { useState, useCallback } from 'react';

import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Icon,
  IconTooltip,
  Select,
  Error,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption, InsertConfigurationOptions } from 'typings';

import useRemoveInappropriateContentFlag from 'api/inappropriate_content_flags/useRemoveInappropriateContentFlag';
import useAuthUser from 'api/me/useAuthUser';
import useModerationsCount from 'api/moderation_count/useModerationsCount';
import { IModerationData, TModeratableType } from 'api/moderations/types';
import useModerations from 'api/moderations/useModerations';
import useUpdateModerationStatus from 'api/moderations/useUpdateModerationStatus';

import ProjectSelector from 'components/admin/ProjectSelector';
import { PageTitle } from 'components/admin/Section';
import Outlet from 'components/Outlet';
import Pagination from 'components/Pagination';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Checkbox from 'components/UI/Checkbox';
import SearchInput from 'components/UI/SearchInput';
import Tabs, { ITabItem } from 'components/UI/Tabs';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { insertConfiguration } from 'utils/moduleUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import ModerationRow from './ModerationRow';
import SelectType from './SelectType';
import tracks from './tracks';

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

const MarkAsButton = styled(ButtonWithLink)`
  margin-right: 20px;
`;

const StyledTabs = styled(Tabs)`
  margin-right: 20px;
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
  color: ${colors.primary};
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
  margin-bottom: 18px;
`;

const EmptyMessage = styled.div`
  max-width: 350px;
  color: ${colors.primary};
  font-size: ${fontSizes.m}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
`;

const StyledSearchInput = styled(SearchInput)`
  margin-left: auto;
  width: 320px;
`;

const Uppercase = styled.span`
  text-transform: uppercase;
`;

export interface ITabNamesMap {
  read: 'read';
  unread: 'unread';
  warnings: 'warnings';
}

export type TActivityTabName = ITabNamesMap[keyof ITabNamesMap];

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

const Moderation = () => {
  const { data: authUser } = useAuthUser();

  const { formatMessage } = useIntl();
  const { mutateAsync: updateModerationStatus } = useUpdateModerationStatus();
  const { mutateAsync: removeInappropriateContentFlag } =
    useRemoveInappropriateContentFlag();

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

  const [selectedTab, setSelectedTab] = useState<TActivityTabName>('unread');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [actionBarErrorMessage, setActionBarErrorMessage] = useState<
    string | null
  >(null);
  const [tabs, setTabs] = useState<ITabItem[]>([
    {
      name: 'unread',
      label: formatMessage(messages.unread),
    },
    {
      name: 'read',
      label: formatMessage(messages.read),
    },
  ]);

  const handleData = useCallback(
    (data: InsertConfigurationOptions<ITabItem>) =>
      setTabs((tabs) => insertConfiguration(data)(tabs)),
    []
  );

  const moderationStatus = selectedTab === 'warnings' ? undefined : selectedTab;

  const { data: moderations } = useModerations({
    pageSize: selectedPageSize,
    moderationStatus,
    pageNumber: selectedPageNumber,
    searchTerm,
    moderatableTypes: selectedTypes,
    projectIds: selectedProjectIds,
    isFlagged: selectedTab === 'warnings',
  });

  const { data: moderationsWithActiveFlagCount } = useModerationsCount({
    isFlagged: true,
  });

  if (!authUser || !isAdmin(authUser)) {
    return null;
  }

  const handleOnSelectAll = (_event: React.ChangeEvent) => {
    if (!processing && !isNilOrError(moderations)) {
      setSelectedModerations(
        selectedModerations.length < moderations.data.length
          ? moderations.data
          : []
      );
    }
  };

  const handleOnTabChange = (tabName: TActivityTabName) => {
    setSelectedTab(tabName);
    setSelectedModerations([]);
    trackEventByName(tracks.tabClicked, {
      tabName,
    });
  };

  const handleOnPageNumberChange = (pageNumber: number) => {
    trackEventByName(tracks.pageNumberClicked);
    setSelectedModerations([]);
    setSelectedPageNumber(pageNumber);
  };

  const handleOnPageSizeChange = (option: IOption) => {
    setSelectedPageSize(option.value);
    setSelectedModerations([]);
  };

  const handleOnModeratableTypesChange = (
    newSelectedTypes: TModeratableType[]
  ) => {
    setSelectedTypes(newSelectedTypes);
    trackEventByName(tracks.typeFilterUsed);
  };

  const handleOnProjectIdsChange = (newProjectIds: string[]) => {
    setSelectedProjectIds(newProjectIds);
    trackEventByName(tracks.projectFilterUsed);
  };

  const handleSearchTermChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    trackEventByName(tracks.searchUsed, {
      searchTerm,
    });
  };

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
        setActionBarErrorMessage(formatMessage(messages.removeFlagsError));
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
        updateModerationStatus({
          moderationId: moderation.id,
          moderatableType: moderation.attributes.moderatable_type,
          moderationStatus: updatedModerationStatus,
        })
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
        setActionBarErrorMessage(formatMessage(messages.markFlagsError));
        setProcessing(false);
      }
    }
  };

  if (moderations) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const lastPage = getPageNumberFromUrl(moderations.links?.last) || 1;
    return (
      <Container>
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
                      ? moderationsWithActiveFlagCount.data.attributes.count
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
                <ProjectSelector
                  title={formatMessage(messages.project)}
                  selectedProjectIds={selectedProjectIds}
                  onChange={handleOnProjectIdsChange}
                />
              </>
            ) : (
              <Buttons>
                {selectedModerations.length > 0 &&
                  (selectedTab === 'read' || selectedTab === 'unread') && (
                    <MarkAsButton
                      icon={moderationStatus === 'unread' ? 'eye' : 'eye-off'}
                      buttonStyle="admin-dark"
                      processing={processing}
                      onClick={markAs}
                    >
                      {formatMessage(
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
            <StyledSearchInput
              onChange={handleSearchTermChange}
              a11y_numberOfSearchResults={moderations.data.length}
            />
          </ActionBarTop>
          <ActionBarBottom>
            <Error text={actionBarErrorMessage} />
          </ActionBarBottom>
        </ActionBar>

        <Table innerBorders={{ bodyRows: true }}>
          <Thead>
            <Tr>
              <Th className="checkbox">
                <StyledCheckbox
                  checked={
                    moderations.data.length > 0 &&
                    selectedModerations.length === moderations.data.length
                  }
                  indeterminate={
                    selectedModerations.length > 0 &&
                    selectedModerations.length < moderations.data.length
                  }
                  disabled={moderations.data.length === 0}
                  onChange={handleOnSelectAll}
                />
              </Th>
              <Th className="date">
                <Uppercase>
                  <FormattedMessage {...messages.date} />
                </Uppercase>
              </Th>
              <Th className="type">
                <Uppercase>
                  <FormattedMessage {...messages.type} />
                </Uppercase>
              </Th>
              <Th className="belongsTo">
                <Uppercase>
                  <FormattedMessage {...messages.belongsTo} />
                </Uppercase>
              </Th>
              <Th className="content">
                <Uppercase>
                  <FormattedMessage {...messages.content} />
                </Uppercase>
              </Th>
              <Th className="goto">&nbsp;</Th>
            </Tr>
          </Thead>
          {moderations.data.length > 0 && (
            <Tbody>
              {moderations.data.map((moderationItem) => (
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
            </Tbody>
          )}
        </Table>

        {moderations.data.length > 0 && (
          <Footer>
            <StyledPagination
              currentPage={selectedPageNumber}
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
                value={pageSizes.find(
                  (item) => item.value === selectedPageSize
                )}
              />
            </RowsPerPage>
          </Footer>
        )}

        {moderations.data.length === 0 && (
          <Empty>
            <EmptyIcon name="inbox" width="60px" height="60px" fill="#bfe7eb" />
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
};

export default Moderation;
