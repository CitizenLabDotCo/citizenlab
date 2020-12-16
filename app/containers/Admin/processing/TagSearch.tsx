// Libraries
import React, { memo, useEffect, useState } from 'react';
import { first } from 'rxjs/operators';
import { isNonEmptyString } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// Components
import AsyncSelectCreatable from 'react-select/async-creatable';

// Style
import styled from 'styled-components';
import selectStyles from 'components/UI/MultipleSelect/styles';

// Typings
import { IOption } from 'typings';
import { ITag, tagsStream } from 'services/tags';
import { getTagValidation } from 'utils/tagUtils';
import useLocalize from 'hooks/useLocalize';

const Container = styled.div``;

const SelectGroupsContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: flex-start;
  align-items: center;
`;

const StyledAsyncSelectCreatable = styled(AsyncSelectCreatable)`
  flex-grow: 4;
`;

interface Props {
  filteredOutTags: ITag[];
  onAddSelect: (tagId: string) => Promise<any> | null;
  onAddNew: (tagText: string) => Promise<any> | null;
  onType: (isValidInput: boolean) => void;
  handlePreventNavigation: (isNavigationPrevented: boolean) => void;
}

const TagSearch = memo(
  ({
    filteredOutTags,
    handlePreventNavigation,
    onType,
    onAddSelect,
    onAddNew,
    intl,
  }: Props & InjectedIntlProps) => {
    const [selection, setSelection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    const localize = useLocalize();

    useEffect(() => {
      loadOptions('', () => {});
    }, [filteredOutTags]);

    const getOptions = (tags: ITag[]) => {
      return tags
        .filter(
          (tag) => !filteredOutTags.some((outTag) => tag.id === outTag.id)
        )
        .map((tag) => ({
          value: tag.id,
          label: localize(tag.attributes.title_multiloc),
        }));
    };

    const loadOptions = (inputValue: string, callback) => {
      if (inputValue) {
        setLoading(true);
        setSearchInput(inputValue);

        tagsStream({
          queryParameters: {
            search: inputValue,
          },
        })
          .observable.pipe(first())
          .subscribe((response) => {
            const options = getOptions(response.data);
            setLoading(false);

            callback(options);
          });
      }
    };

    const handleOnChange = async (selection: IOption) => {
      await onAddSelect(selection.value);
      setSelection(null);
      setProcessing(false);
    };

    const handleOnNewTag = async (searchInput) => {
      setProcessing(false);

      try {
        await onAddNew(searchInput);
        setSelection(null);
        setProcessing(false);
      } catch {
        setSelection(null);
        setProcessing(false);
      }
    };

    const noOptionsMessage = (inputValue: string) => {
      if (!isNonEmptyString(inputValue)) {
        return null;
      }
      return intl.formatMessage(messages.createTag);
    };

    const formatCreateLabel = (inputValue) => {
      if (!isNonEmptyString(inputValue)) {
        return null;
      }
      return intl.formatMessage(messages.createTag);
    };

    const isValidInput = (inputValue) => {
      const isValidInput =
        getTagValidation(inputValue) &&
        !filteredOutTags.some(
          (outTag) => localize(outTag.attributes.title_multiloc) === inputValue
        );
      if (!inputValue) {
        handlePreventNavigation(false);
      } else {
        handlePreventNavigation(true);
      }
      onType(isValidInput);
      return isValidInput;
    };

    const isDropdownIconHidden = !isNonEmptyString(searchInput);
    return (
      <Container>
        <SelectGroupsContainer>
          <StyledAsyncSelectCreatable
            menuPlacement="top"
            name="search-tag"
            isMulti={false}
            cacheOptions={false} // TOCHECK
            defaultOptions={false}
            loadOptions={loadOptions}
            isLoading={loading}
            isDisabled={processing}
            onChange={handleOnChange}
            formatCreateLabel={formatCreateLabel}
            styles={selectStyles}
            value={selection}
            onCreateOption={handleOnNewTag}
            isValidNewOption={isValidInput}
            noOptionsMessage={noOptionsMessage}
            autoFocus={true}
            components={
              isDropdownIconHidden && {
                DropdownIndicator: () => null,
              }
            }
          />
        </SelectGroupsContainer>
      </Container>
    );
  }
);

export default injectIntl(TagSearch);
