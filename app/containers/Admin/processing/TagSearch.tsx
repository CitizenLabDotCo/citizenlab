// Libraries
import React, { PureComponent } from 'react';
import { first } from 'rxjs/operators';
import { isNonEmptyString } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import AsyncSelect from 'react-select/async';

// Style
import styled from 'styled-components';
import selectStyles from 'components/UI/MultipleSelect/styles';

// Typings
import { IOption } from 'typings';
import GetTags, { GetTagsChildProps } from 'resources/GetTags';
import { ITag, tagStream } from 'services/tags';
import { addTagging } from 'services/taggings';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

const Container = styled.div`
  width: 80%;
  margin-bottom: 20px;
`;

const SelectGroupsContainer = styled.div`
  width: fit-content;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  align-items: center;
  margin-bottom: 30px;
`;

const StyledAsyncSelect = styled(AsyncSelect)`
  min-width: 300px;
`;

const AddGroupButton = styled(Button)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 20px;
`;

interface InputProps {
  ideaId: string;
  ideaTagIds: (string | undefined)[];
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

  getOptions = (tags: ITag[]) => {
    return tags
      .filter((tag) => !this.props.ideaTagIds.includes(tag.id))
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
    this.setState({ selection });
  };

  handleOnAddTagClick = async () => {
    const { selection, searchInput } = this.state;
    const {
      intl: { locale },
    } = this.props;

    console.log('click', searchInput, selection);
    if (selection) {
      console.log('LALALLA');
      this.setState({ processing: true });

      try {
        await addTagging(this.props.ideaId, selection.value);
        this.setState({ selection: null, processing: false });
      } catch {
        this.setState({ selection: null, processing: false });
      }
    } else if (searchInput && searchInput.length > 0) {
      this.setState({ processing: true });

      try {
        const title_multiloc = {};
        title_multiloc[locale] = searchInput;
        console.log();
        await addTagging(this.props.ideaId, null, { title_multiloc });
        this.setState({ selection: null, processing: false });
      } catch {
        this.setState({ selection: null, processing: false });
      }
    }
  };

  setSearchInput = (inputValue: string, { action }) => {
    if (!['input-blur', 'menu-close'].includes(action)) {
      return this.setState(
        { selection: null, searchInput: inputValue },
        () => this.state.searchInput
      );
    } else {
      return this.state.searchInput;
    }
  };

  noOptionsMessage = (inputValue: string) => {
    if (!isNonEmptyString(inputValue)) {
      return null;
    }
    return this.props.intl.formatMessage(messages.createTag);
  };

  render() {
    const { searchInput, selection } = this.state;
    const { formatMessage } = this.props.intl;
    console.log(searchInput, selection);

    const isDropdownIconHidden = !isNonEmptyString(searchInput);
    return (
      <Container>
        <SelectGroupsContainer>
          <StyledAsyncSelect
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
            noOptionsMessage={this.noOptionsMessage}
            onInputChange={this.setSearchInput}
            components={
              isDropdownIconHidden && {
                DropdownIndicator: () => null,
              }
            }
          />

          <AddGroupButton
            buttonStyle="cl-blue"
            icon="plus-circle"
            padding="13px 16px"
            onClick={this.handleOnAddTagClick}
            processing={this.state.processing}
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
