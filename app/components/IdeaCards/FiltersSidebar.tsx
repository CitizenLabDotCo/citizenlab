import React, { memo, useCallback, useEffect, MouseEvent } from 'react';

// components
import SearchInput from 'components/UI/SearchInput';
import IdeasStatusFilter from './StatusFilterBox';
import IdeasTopicsFilter from './TopicFilterBox';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// typings
import { IQueryParameters } from 'resources/GetIdeas';

const Container = styled.div`
  position: relative;
`;

const ClearFiltersText = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: auto;
`;

const ClearFiltersButton = styled.button`
  height: 32px;
  position: absolute;
  top: -48px;
  right: 0px;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  cursor: pointer;

  &:hover {
    ${ClearFiltersText} {
      color: #000;
    }
  }
`;

const StyledSearchInput = styled(SearchInput)`
  margin-bottom: 20px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledIdeasStatusFilter = styled(IdeasStatusFilter)`
  margin-bottom: 20px;
`;

const StyledIdeasTopicsFilter = styled(IdeasTopicsFilter)`
  margin-bottom: 0px;
`;

interface Props {
  selectedIdeaFilters: Partial<IQueryParameters>;
  className?: string;
  onApply?: () => void;
  onChange: (arg: Partial<IQueryParameters>) => void;
  onClose?: () => void;
  onReset?: () => void;
}

const FiltersSidebar = memo<Props & InjectedIntlProps>(({ selectedIdeaFilters, className, onApply, onChange, onClose, onReset, intl }) => {

  useEffect(() => {
    const subscriptions = [
      eventEmitter.observeEvent('closeIdeaFilters').subscribe(() => {
        onClose && onClose();
      }),

      eventEmitter.observeEvent('clearIdeaFilters').subscribe(() => {
        onChange({
          idea_status: null,
          areas: null,
          topics: null
        });
      }),

      eventEmitter.observeEvent('applyIdeaFilters').subscribe(() => {
        onApply && onApply();
      })
    ];

    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, []);

  const handleSearchOnChange = useCallback((search: string | null) => {
    onChange({ search });
  }, []);

  const handleStatusOnChange = useCallback((idea_status: string | null) => {
    onChange({ idea_status });
  }, []);

  const handleTopicsOnChange = useCallback((topics: string[] | null) => {
    onChange({ topics });
  }, []);

  const handleIdeaFiltersOnReset = useCallback(() => {
    onReset && onReset();
  }, []);

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const searchPlaceholder = intl.formatMessage(messages.searchPlaceholder);
  const searchAriaLabel = intl.formatMessage(messages.searchPlaceholder);

  return (
    <Container className={className}>
      {(selectedIdeaFilters.search || selectedIdeaFilters.idea_status || selectedIdeaFilters.areas || selectedIdeaFilters.topics) &&
        <ClearFiltersButton onMouseDown={removeFocus} onClick={handleIdeaFiltersOnReset}>
          <ClearFiltersText>
            <FormattedMessage {...messages.resetFilters} />
          </ClearFiltersText>
        </ClearFiltersButton>
      }

      <StyledSearchInput
        placeholder={searchPlaceholder}
        ariaLabel={searchAriaLabel}
        value={selectedIdeaFilters.search || null}
        onChange={handleSearchOnChange}
      />
      <StyledIdeasStatusFilter
        selectedStatusId={selectedIdeaFilters.idea_status}
        selectedIdeaFilters={selectedIdeaFilters}
        onChange={handleStatusOnChange}
      />
      <StyledIdeasTopicsFilter
        selectedTopicIds={selectedIdeaFilters.topics}
        onChange={handleTopicsOnChange}
      />
    </Container>
  );
});

export default injectIntl(FiltersSidebar);
