import React, { useState, useCallback, useEffect, useRef } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import getInputsCategoryFilter from 'modules/commercial/insights/utils/getInputsCategoryFilter';

// hooks
import useInsightsInputs, {
  defaultPageSize,
} from 'modules/commercial/insights/hooks/useInsightsInputs';
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

// components
import { Table, Icon, Box } from 'cl2-component-library';
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
import ScanCategory from './ScanCategory';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

const Inputs = styled.div`
  flex: 1;
  background: #fff;
  overflow-x: auto;
  overflow-y: auto;
  padding: 40px;
  border-left: 1px solid ${colors.separation};
`;

const TitleRow = styled.div`
  display: flex;
  min-height: 43px;
`;

const StyledActions = styled(Actions)`
  margin-left: 60px;
`;

const StyledDivider = styled(Divider)`
  margin-top: 6px;
`;

const StyledTable = styled(Table)`
  thead {
    tr {
      th {
        padding: 12px 4px;
        font-weight: bold;
      }
    }
  }
  tbody {
    tr {
      cursor: pointer;
      height: 56px;

      td {
        padding: 12px 4px;
        color: ${colors.label};
        font-size: ${fontSizes.small}px;
        > * {
          margin: 0;
        }
      }
    }
    tr:hover {
      background-color: ${colors.background};
    }
  }
`;

const StyledSort = styled.div`
  display: flex;
  align-items: center !important;
  cursor: pointer;
  font-weight: bold;
  svg {
    width: 10px;
    margin-left: 4px;
  }
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
  color: ${colors.adminTextColor};
  background-color: ${colors.clBlueLightest};
  padding: 20px;
  border-radius: 3px;
  text-align: center;
  margin-bottom: 28px;
  svg {
    fill: ${colors.clBlue};
    margin-right: 8px;
  }
`;

const InputsTable = ({
  params: { viewId },
  location: { pathname, query },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
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

  const { list: inputs, lastPage, loading, setLoading } = useInsightsInputs(
    viewId,
    {
      pageNumber,
      search,
      sort,
      processed:
        // Include non-processed input in recently posted
        inputsCategoryFilter === 'recentlyPosted'
          ? false
          : // Include both processed and unprocessed input in category
          inputsCategoryFilter === 'category'
          ? undefined
          : // Include only processed input everywhere else
            true,

      category: selectedCategory,
    }
  );

  // Callbacks and Effects -----------------------------------------------------

  // Table Selection
  // Reset selection on page change
  useEffect(() => {
    setSelectedRows(new Set());
  }, [selectedCategory, pageNumber]);

  // Update isPreviewedInputInTable ref value
  useEffect(() => {
    if (!isNilOrError(inputs)) {
      const inputsIds = inputs.map((input) => input.id);
      const isInTable = inputsIds.includes(query.previewedInputId);

      isPreviewedInputInTable.current = isInTable;

      setIsMoveDownDisabled(
        isInTable && pageNumber === lastPage
          ? previewedInputIndex === inputs.length - 1
          : previewedInputIndex === inputs.length
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
      !isNilOrError(inputs[previewedInputIndex]) &&
      movedUpDown &&
      !loading
    ) {
      clHistory.replace({
        pathname,
        search: stringify(
          {
            ...query,
            previewedInputId: inputs[previewedInputIndex].id,
          },
          { addQueryPrefix: true }
        ),
      });
      setMovedUpDown(false);
    }
  }, [inputs, pathname, previewedInputIndex, query, movedUpDown, loading]);

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
      // Setting the loading state here to ensure it is true in the useEffect that navigates to the selected index
      setLoading(true);
    }
  }, [
    pageNumber,
    pathname,
    selectedCategory,
    sort,
    search,
    query.processed,
    setLoading,
  ]);

  const moveDown = useCallback(() => {
    let hasToLoadNextPage = false;

    setPreviewedInputIndex((prevSelectedIndex) => {
      hasToLoadNextPage = !isNilOrError(inputs)
        ? lastPage !== pageNumber && isPreviewedInputInTable.current
          ? prevSelectedIndex === inputs.length - 1
          : prevSelectedIndex === inputs.length
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
      // Setting the loading state here to ensure it is true in the useEffect that navigates to the selected index
      setLoading(true);
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
    setLoading,
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

  // From this point we need data ----------------------------------------------
  if (isNilOrError(inputs)) {
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
      const newSelection = new Set(inputs.map((input) => input.id));
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
    setPreviewedInputIndex(inputs.indexOf(input));
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
        <SearchInput onChange={onSearch} />
        <Button
          buttonStyle="admin-dark"
          bgColor={colors.clBlue}
          linkTo={`/admin/insights`}
        >
          {formatMessage(messages.inputsDone)}
        </Button>
      </SearchContainer>
      {inputsCategoryFilter === 'recentlyPosted' && inputs.length !== 0 && (
        <RecentlyPostedInfoBox data-testid="insightsRecentlyAddedInfobox">
          <Icon name="showMore" />
          {formatMessage(messages.inputsTableRecentlyPostedInfoBox)}
        </RecentlyPostedInfoBox>
      )}
      {inputsCategoryFilter === 'category' && inputs.length !== 0 && (
        <Box display="flex" justifyContent="flex-end">
          <ScanCategory variant="button" />
        </Box>
      )}
      <TitleRow>
        <TableTitle />
        {inputs.length !== 0 && (
          <StyledActions
            selectedInputs={inputs.filter((input) =>
              selectedRows.has(input.id)
            )}
          />
        )}
      </TitleRow>
      <StyledDivider />
      {inputs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StyledTable>
            <colgroup>
              <col span={1} style={{ width: '2.5%' }} />
              <col span={1} style={{ width: '30%' }} />
              {query.category ? (
                <col span={1} style={{ width: '2.5%' }} />
              ) : null}
              <col span={1} style={{ width: '65%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <CheckboxWithPartialCheck
                    onChange={handleCheckboxChange}
                    checked={
                      selectedRows.size === inputs.length
                        ? true
                        : selectedRows.size === 0
                        ? false
                        : 'mixed'
                    }
                    data-testid="headerCheckBox"
                  />
                </th>
                <th>{formatMessage(messages.inputsTableInputs)}</th>
                <th>
                  {query.category ? (
                    <StyledSort
                      onClick={onSort}
                      as="button"
                      data-testid="insightsSortButton"
                    >
                      {formatMessage(messages.inputsTableCategories)}
                      <Icon
                        name={
                          query.sort === '-approval'
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                      />
                    </StyledSort>
                  ) : (
                    formatMessage(messages.inputsTableCategories)
                  )}
                </th>
                {query.category ? (
                  <th>{formatMessage(messages.inputsTableAlsoIn)}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {inputs.map((input) => (
                <InputsTableRow
                  input={input}
                  key={input.id}
                  selected={selectedRows.has(input.id)}
                  changeSelected={toggleInputSelected(input)}
                  onPreview={previewInput(input)}
                />
              ))}
            </tbody>
          </StyledTable>
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
