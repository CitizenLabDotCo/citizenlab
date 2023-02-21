import React, { useState, useCallback, useEffect, useRef } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { stringify } from 'qs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import getInputsCategoryFilter from 'modules/commercial/insights/utils/getInputsCategoryFilter';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useInputs, {
  defaultPageSize,
} from 'modules/commercial/insights/api/inputs/useInputs';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import useScanForCategorySuggestions from 'modules/commercial/insights/api/category_suggestions/useScanForCategorySuggestions';
// components
import {
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Icon,
  Box,
  Spinner,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import InputsTableRow from './InputsTableRow';
import EmptyState from './EmptyState';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';
import SideModal from 'components/UI/SideModal';
import InputDetails from '../InputDetails';
import Divider from 'components/admin/Divider';
import Actions from './Actions';
import Pagination from 'components/Pagination';
import SearchInput from 'components/UI/SearchInput';
import TableTitle from './TableTitle';
import Export from './Export';
import ScanCategory from './ScanCategory';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';
import { IInsightsInputData } from 'modules/commercial/insights/api/inputs/types';

const Inputs = styled.div`
  flex: 1;
  background: #fff;
  overflow-x: auto;
  overflow-y: auto;
  padding: 40px;
  border-left: 1px solid ${colors.divider};
`;

const StyledActions = styled(Actions)`
  margin-left: 60px;
`;

const StyledDivider = styled(Divider)`
  margin-top: 6px;
`;

const StyledPagination = styled(Pagination)`
  display: block;
  margin-top: 12px;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-content: center;
  margin-bottom: 40px;
`;

const RecentlyPostedInfoBox = styled.div`
  color: ${colors.primary};
  background-color: ${colors.teal100};
  padding: 20px;
  border-radius: 3px;
  text-align: center;
  margin-bottom: 28px;
  svg {
    fill: ${colors.teal};
    margin-right: 8px;
  }
`;

const InputsTable = ({
  params: { viewId },
  location: { pathname, query },
  intl: { formatMessage },
}: WithRouterProps & WrappedComponentProps) => {
  // State
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [previewedInputIndex, setPreviewedInputIndex] = useState<number | null>(
    null
  );
  // Use ref for isPreviewedInputInTable to avoid dependencies in moveUp and moveDown
  const isPreviewedInputInTable = useRef(true);
  const [isMoveDownDisabled, setIsMoveDownDisabled] = useState(false);
  const [movedUpDown, setMovedUpDown] = useState(false);

  // Data fetching -------------------------------------------------------------
  const pageNumber = parseInt(query?.pageNumber, 10);
  const selectedCategory = query.category;
  const search = query.search;
  const inputsCategoryFilter = getInputsCategoryFilter(
    selectedCategory,
    query.processed
  );
  const sort = query.sort;

  const processed =
    // Include non-processed input in recently posted
    inputsCategoryFilter === 'recentlyPosted'
      ? false
      : // Include both processed and unprocessed input in category
      inputsCategoryFilter === 'category'
      ? undefined
      : // Include only processed input everywhere else
        true;

  const { data: inputs, isLoading } = useInputs(viewId, {
    pageNumber,
    search,
    sort,
    processed,
    category: selectedCategory,
    pageSize: defaultPageSize,
  });

  const lastPage = inputs ? getPageNumberFromUrl(inputs.links?.last) : 1;

  const {
    status,
    progress,
    triggerScan,
    cancelScan,
    onDone,
    isLoading: isScanLoading,
  } = useScanForCategorySuggestions(viewId, query.category, processed);

  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });
  // Callbacks and Effects -----------------------------------------------------

  // Table Selection
  // Reset selection on page change
  useEffect(() => {
    setSelectedRows(new Set());
  }, [selectedCategory, pageNumber]);

  // Update isPreviewedInputInTable ref value
  useEffect(() => {
    if (!isNilOrError(inputs)) {
      const inputsIds = inputs.data.map((input) => input.id);
      const isInTable = inputsIds.includes(query.previewedInputId);

      isPreviewedInputInTable.current = isInTable;

      setIsMoveDownDisabled(
        isInTable && pageNumber === lastPage
          ? previewedInputIndex === inputs.data.length - 1
          : previewedInputIndex === inputs.data.length
      );
    }
  }, [
    inputs,
    query.previewedInputId,
    previewedInputIndex,
    pageNumber,
    lastPage,
  ]);

  // Navigate to correct index when moving up and down
  useEffect(() => {
    if (
      !isNilOrError(inputs) &&
      !isNilOrError(previewedInputIndex) &&
      !isNilOrError(inputs.data[previewedInputIndex]) &&
      movedUpDown &&
      !isLoading
    ) {
      setMovedUpDown(false);
      clHistory.replace({
        pathname,
        search: stringify(
          {
            ...query,
            previewedInputId: inputs.data[previewedInputIndex].id,
          },
          { addQueryPrefix: true }
        ),
      });
    }
  }, [inputs, pathname, previewedInputIndex, query, movedUpDown, isLoading]);

  // Side Modal Preview
  // Use callback to keep references for moveUp and moveDown stable
  const moveUp = useCallback(() => {
    let hasToLoadPrevPage = false;

    setPreviewedInputIndex((prevSelectedIndex) => {
      hasToLoadPrevPage = pageNumber !== 1 && prevSelectedIndex === 0;

      return hasToLoadPrevPage
        ? defaultPageSize - 1
        : !isNilOrError(prevSelectedIndex)
        ? prevSelectedIndex - 1
        : prevSelectedIndex;
    });
    setMovedUpDown(true);

    if (hasToLoadPrevPage) {
      clHistory.replace({
        pathname,
        search: stringify(
          {
            sort,
            search,
            category: selectedCategory,
            processed: query.processed,
            pageNumber: pageNumber - 1,
          },
          { addQueryPrefix: true }
        ),
      });
    }
  }, [pageNumber, pathname, selectedCategory, sort, search, query.processed]);

  const moveDown = useCallback(() => {
    let hasToLoadNextPage = false;
    setPreviewedInputIndex((prevSelectedIndex) => {
      hasToLoadNextPage = !isNilOrError(inputs)
        ? lastPage !== pageNumber && isPreviewedInputInTable.current
          ? prevSelectedIndex === inputs.data.length - 1
          : prevSelectedIndex === inputs.data.length
        : false;

      return hasToLoadNextPage
        ? 0
        : !isNilOrError(prevSelectedIndex) && isPreviewedInputInTable.current
        ? prevSelectedIndex + 1
        : prevSelectedIndex;
    });

    setMovedUpDown(true);

    if (hasToLoadNextPage) {
      clHistory.replace({
        pathname,
        search: stringify(
          {
            sort,
            search,
            category: selectedCategory,
            processed: query.processed,
            pageNumber: pageNumber + 1,
          },
          { addQueryPrefix: true }
        ),
      });
    }
  }, [
    inputs,
    pageNumber,
    lastPage,
    pathname,
    selectedCategory,
    sort,
    search,
    query.processed,
  ]);

  // Search
  const onSearch = useCallback(
    (newSearch: string) => {
      if (newSearch !== search) {
        clHistory.replace({
          pathname,
          search: stringify(
            {
              sort,
              search: newSearch,
              category: selectedCategory,
              processed: query.processed,
              pageNumber: 1,
            },
            { addQueryPrefix: true }
          ),
        });
      }
    },
    [pathname, selectedCategory, sort, search, query.processed]
  );

  if (isLoading) {
    return (
      <Box pt="40px" margin="auto">
        <Spinner />
      </Box>
    );
  }

  if (!inputs) {
    return null;
  }

  // Pagination ----------------------------------------------------------------
  const handlePaginationClick = (newPageNumber: number) => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, pageNumber: newPageNumber },
        { addQueryPrefix: true }
      ),
    });
  };

  // Selection and Actions -----------------------------------------------------
  const handleCheckboxChange = () => {
    if (selectedRows.size === 0) {
      const newSelection = new Set(inputs?.data.map((input) => input.id));
      setSelectedRows(newSelection);
    } else {
      const newSelection = new Set<string>();
      setSelectedRows(newSelection);
    }
  };

  const toggleInputSelected = (input: IInsightsInputData) => () => {
    const newSelection = new Set(selectedRows);
    if (selectedRows.has(input.id)) {
      newSelection.delete(input.id);
      setSelectedRows(newSelection);
    } else {
      newSelection.add(input.id);
      setSelectedRows(newSelection);
    }
  };

  // Side Modal Preview --------------------------------------------------------
  const closeSideModal = () => setIsSideModalOpen(false);

  const openSideModal = () => setIsSideModalOpen(true);

  const previewInput = (input: IInsightsInputData) => () => {
    setPreviewedInputIndex(inputs.data.indexOf(input));
    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, previewedInputId: input.id },
        { addQueryPrefix: true }
      ),
    });
    openSideModal();
  };

  const onSort = () => {
    clHistory.push({
      pathname,
      search: stringify(
        {
          ...query,
          sort: query.sort === '-approval' ? 'approval' : '-approval',
        },
        { addQueryPrefix: true }
      ),
    });
  };

  return (
    <Inputs data-testid="insightsInputsTable">
      <SearchContainer>
        <SearchInput
          onChange={onSearch}
          a11y_numberOfSearchResults={inputs.data.length}
        />
        <Box display="flex" alignItems="center">
          {inputs.data.length > 0 && nlpFeatureFlag && status === 'isIdle' && (
            <Box alignItems="center" mr="16px">
              <Button
                className="intercom-insights-edit-scan-button"
                buttonStyle="secondary"
                textColor={colors.primary}
                onClick={triggerScan}
                data-testid="insightsScanCategory-button"
                processing={isLoading}
              >
                {formatMessage(messages.categoriesScanButton)}
              </Button>
            </Box>
          )}
          <Button
            className="intercom-insights-edit-done-button"
            buttonStyle="admin-dark"
            bgColor={colors.teal}
            linkTo={`/admin/reporting/insights/${viewId}`}
          >
            {formatMessage(messages.inputsDone)}
          </Button>
        </Box>
      </SearchContainer>
      {inputsCategoryFilter === 'recentlyPosted' && inputs.data.length !== 0 && (
        <RecentlyPostedInfoBox data-testid="insightsRecentlyAddedInfobox">
          <Icon name="refresh" />
          {formatMessage(messages.inputsTableRecentlyPostedInfoBox)}
        </RecentlyPostedInfoBox>
      )}
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" minHeight="44px">
          <TableTitle />
          {inputs.data.length !== 0 && (
            <StyledActions
              selectedInputs={inputs.data.filter((input) =>
                selectedRows.has(input.id)
              )}
            />
          )}
        </Box>
        {inputs.data.length !== 0 && <Export />}
      </Box>
      <StyledDivider />
      {((inputs.data.length === 0 && inputsCategoryFilter === 'category') ||
        status !== 'isIdle') && (
        <ScanCategory
          status={status}
          progress={progress}
          triggerScan={triggerScan}
          cancelScan={cancelScan}
          onClose={onDone}
          key={`${query.category} ${processed}`}
          isLoading={isScanLoading}
        />
      )}
      {inputs.data.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Table
            borderBottom={`1px solid ${colors.grey200}`}
            innerBorders={{ bodyRows: true }}
          >
            <Thead>
              <Tr>
                <Th width="2.5%" px="4px">
                  <CheckboxWithPartialCheck
                    onChange={handleCheckboxChange}
                    checked={
                      selectedRows.size === inputs.data.length
                        ? true
                        : selectedRows.size === 0
                        ? false
                        : 'mixed'
                    }
                    data-testid="headerCheckBox"
                  />
                </Th>
                <Th width="30%">{formatMessage(messages.inputsTableInputs)}</Th>
                {query.category ? (
                  <Th
                    clickable
                    sortDirection={
                      query.sort === '-approval' ? 'ascending' : 'descending'
                    }
                    onClick={onSort}
                    data-testid="insightsSortButton"
                  >
                    {formatMessage(messages.inputsTableCategories)}
                  </Th>
                ) : (
                  <Th>{formatMessage(messages.inputsTableCategories)}</Th>
                )}
                {query.category ? (
                  <Th width="65%">
                    {formatMessage(messages.inputsTableAlsoIn)}
                  </Th>
                ) : null}
              </Tr>
            </Thead>
            <Tbody>
              {inputs.data.map((input) => (
                <InputsTableRow
                  input={input}
                  key={input.id}
                  selected={selectedRows.has(input.id)}
                  changeSelected={toggleInputSelected(input)}
                  onPreview={previewInput(input)}
                />
              ))}
            </Tbody>
          </Table>
          <StyledPagination
            currentPage={pageNumber || 1}
            totalPages={lastPage || 1}
            loadPage={handlePaginationClick}
          />
        </>
      )}
      <SideModal opened={isSideModalOpen} close={closeSideModal}>
        {query.previewedInputId && (
          <InputDetails
            // Rely on url query for previewedInputId
            previewedInputId={query.previewedInputId}
            moveUp={moveUp}
            moveDown={moveDown}
            isMoveUpDisabled={previewedInputIndex === 0 && pageNumber === 1}
            isMoveDownDisabled={isMoveDownDisabled}
          />
        )}
      </SideModal>
    </Inputs>
  );
};

export default withRouter(injectIntl(InputsTable));
