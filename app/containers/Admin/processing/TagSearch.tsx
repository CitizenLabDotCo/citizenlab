// Libraries
import React, { PureComponent } from 'react';
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
import GetTags, { GetTagsChildProps } from 'resources/GetTags';
import { ITag, tagStream } from 'services/tags';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

const Container = styled.div`
  margin-bottom: 20px;
`;

const SelectGroupsContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: flex-start;
  align-items: center;
  margin-bottom: 30px;
`;

const StyledAsyncSelectCreatable = styled(AsyncSelectCreatable)`
  flex-grow: 4;
`;

interface InputProps {
  filteredOutTagIds: (string | undefined)[];
  onAddSelect: (tagId: string) => Promise<any> | null;
  onAddNew: (tagText: string) => Promise<any> | null;
}

interface DataProps {
  tags: GetTagsChildProps;
}

interface State {
  selection: IOption | null;
  loading: boolean;
  processing: boolean;
  searchInput: string;
}

class TagAdd extends PureComponent<
  InputProps & DataProps & InjectedIntlProps & InjectedLocalized,
  State
> {
  constructor(
    props: InputProps & DataProps & InjectedIntlProps & InjectedLocalized
  ) {
    super(props);
    this.state = {
      selection: null,
      loading: false,
      processing: false,
      searchInput: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filteredOutTagIds !== this.props.filteredOutTagIds) {
      this.loadOptions('', () => {});
    }
  }

  getOptions = (tags: ITag[]) => {
    return tags
      .filter((tag) => !this.props.filteredOutTagIds.includes(tag.id))
      .map((tag) => ({
        value: tag.id,
        label: this.props.localize(tag.attributes.title_multiloc),
      }));
  };

  loadOptions = (inputValue: string, callback) => {
    if (inputValue) {
      this.setState({ loading: true });

      tagStream({
        queryParameters: {
          search: inputValue,
        },
      })
        .observable.pipe(first())
        .subscribe((response) => {
          const options = this.getOptions(response.data);
          this.setState({ loading: false });

          callback(options);
        });
    }
  };

  handleOnChange = async (selection: IOption) => {
    await this.props.onAddSelect(selection.value);
    this.setState({ selection: null, processing: false });
  };

  handleOnNewTag = async (searchInput) => {
    this.setState({ processing: true });

    try {
      await this.props.onAddNew(searchInput);
      this.setState({ selection: null, processing: false });
    } catch {
      this.setState({ selection: null, processing: false });
    }
  };

  noOptionsMessage = (inputValue: string) => {
    if (!isNonEmptyString(inputValue)) {
      return null;
    }
    return this.props.intl.formatMessage(messages.createTag);
  };

  formatCreateLabel = (inputValue) => {
    if (!isNonEmptyString(inputValue)) {
      return null;
    }
    return this.props.intl.formatMessage(messages.createTag);
  };

  render() {
    const { searchInput, selection } = this.state;
    const { formatMessage } = this.props.intl;

    const isDropdownIconHidden = !isNonEmptyString(searchInput);
    return (
      <Container>
        <SelectGroupsContainer>
          <StyledAsyncSelectCreatable
            name="search-tag"
            isMulti={false}
            cacheOptions={false} // TOCHECK
            defaultOptions={false}
            loadOptions={this.loadOptions}
            isLoading={this.state.loading}
            isDisabled={this.state.processing}
            onChange={this.handleOnChange}
            placeholder={formatMessage(messages.addTag)}
            styles={selectStyles}
            value={selection}
            onCreateOption={this.handleOnNewTag}
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
}

const TaggAddWithHocs = injectIntl(injectLocalize(TagAdd));

export default (props: InputProps) => (
  <GetTags>{(tags) => <TaggAddWithHocs {...props} tags={tags} />}</GetTags>
);
