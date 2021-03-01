import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  useRef,
  Dispatch,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { includes } from 'lodash-es';

// components
import ProcessingRow from './ProcessingRow';
import { Checkbox, fontSizes, Spinner } from 'cl2-component-library';
import Table from 'components/UI/Table';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';

// styling
import styled from 'styled-components';

// typings
import { adopt } from 'react-adopt';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { IIdeaData } from 'services/ideas';
import { ITagging } from 'services/taggings';

// hooks & res
import useKeyPress from '../../../hooks/useKeyPress';
import PostPreview from './PostPreview';
import { CSSTransition } from 'react-transition-group';
import { ITag } from 'services/tags';
import EmptyState from './EmptyState';

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

const StyledSpinner = styled(Spinner)`
  margin: auto;
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: 0px;
`;

interface DataProps {
  ideas: GetIdeasChildProps;
}

interface InputProps {
  projectFilterIds: string[];
  previewPostId: string | null;
  setPreviewPostId: (string: string | null) => void;
  selectedRows: string[];
  setSelectedRows: Dispatch<React.SetStateAction<string[]>>;
  tags: ITag[];
  taggings: ITagging[] | null | undefined | Error;
  unprocessedItemsIds: string[] | null | undefined;
}

interface Props extends InputProps, DataProps {}

const IdeasTable = memo<Props & InjectedIntlProps>(
  ({
    ideas,
    previewPostId,
    setPreviewPostId,
    selectedRows,
    setSelectedRows,
    tags,
    taggings,
    unprocessedItemsIds,
  }) => {
    const [ideaList, setIdeaList] = useState<
      IIdeaData[] | undefined | null | Error
    >([]);

    const [loadingIdeas, setLoadingIdeas] = useState<boolean>(false);
    const [isNavigationPrevented, setIsNavigationPrevented] = useState<boolean>(
      false
    );

    const [highlightedId, setHighlightedId] = useState<string | null>(null);

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
      if (upArrow) {
        trackEventByName('Keyboard shorcut', { key: 'up' });
        !isNavigationPrevented && navigate('up');
      }
    }, [upArrow, ideaList]);

    useEffect(() => {
      if (downArrow) {
        trackEventByName('Keyboard shorcut', { key: 'down' });
        !isNavigationPrevented && navigate('down');
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
      setIdeaList(ideas.list);
      setLoadingIdeas(ideas.querying);
    }, [ideas]);

    useEffect(() => {
      if (!isNilOrError(ideaList) && ideaList.length > 0) {
        setHighlightedId(ideaList[0].id);
      }
      if (loadingIdeas) {
        setLoadingIdeas(false);
      }
    }, [ideaList]);

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

    const handlePreventNavigation = (isNavigationPrevented: boolean) => {
      setIsNavigationPrevented(isNavigationPrevented);
    };

    const getIdeaTaggings = (id: string | null) => {
      if (!isNilOrError(taggings)) {
        return taggings.filter((tagging) => tagging.attributes.idea_id === id);
      }

      return [];
    };

    if (loadingIdeas || taggings === undefined) return <StyledSpinner />;
    if (isNilOrError(ideaList) || isNilOrError(taggings)) return null;

    if (ideaList.length === 0) return <EmptyState reason="noIdeas" />;

    return (
      <>
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
                  processing={!!unprocessedItemsIds?.includes(idea.id)}
                />
              ))}
            </tbody>
          </StyledTable>
        </TableWrapper>
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
              handlePreventNavigation={handlePreventNavigation}
              processing={!!unprocessedItemsIds?.includes(previewPostId || '')}
            />
          </PostPreviewTransitionWrapper>
        </CSSTransition>
      </>
    );
  }
);

const Data = adopt<DataProps, InputProps>({
  ideas: ({ render, projectFilterIds }) => {
    return (
      <GetIdeas
        type="paginated"
        pageSize={200000}
        projectIds={projectFilterIds}
        cache={false}
        mini={true}
        sort="new"
      >
        {render}
      </GetIdeas>
    );
  },
});

const IdeasTableWithIntl = injectIntl(IdeasTable);

export default (inputProps: InputProps) => {
  return (
    <Data {...inputProps}>
      {(dataProps) => <IdeasTableWithIntl {...inputProps} {...dataProps} />}
    </Data>
  );
};
