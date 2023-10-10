import React, { PureComponent } from 'react';
import PlacesAutocomplete, {
  formattedSuggestionType,
} from 'react-places-autocomplete';
import styled from 'styled-components';
import {
  fontSizes,
  defaultStyles,
  defaultInputStyle,
  colors,
} from '../../utils/styleUtils';
import { InputSize } from '../../utils/typings';

const Container = styled.div`
  width: 100%;
  input {
    width: 100%;
    padding: ${defaultStyles.inputPadding} !important;
    ${defaultInputStyle};
  }
`;

const StyledAutocompleteItem = styled.div`
  width: 100%;
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  padding: 12px;

  strong {
    font-weight: 600;
    color: #000;
  }

  &:hover {
    background: #eee;
  }
`;

export interface Props {
  value: string;
  placeholder: string;
  className?: string;
  onBlur?: () => void;
  onChange: (arg: string) => void;
  size?: InputSize;
  id?: string;
}

class LocationInput extends PureComponent<Props> {
  handleSelect = (adress: string) => {
    const { onBlur, onChange } = this.props;
    onChange(adress);
    onBlur?.();
  };

  render() {
    const { className, onChange, size, id } = this.props;
    const value = this.props.value || '';
    const placeholder = this.props.placeholder || '';

    const AutocompleteItem = ({
      formattedSuggestion,
    }: {
      formattedSuggestion: formattedSuggestionType;
    }) => (
      <StyledAutocompleteItem className="autocompleteItemInner">
        <strong>{formattedSuggestion.mainText}</strong>{' '}
        {formattedSuggestion.secondaryText}
      </StyledAutocompleteItem>
    );

    return (
      <Container className={className} size={size}>
        <PlacesAutocomplete
          highlightFirstSuggestion={true}
          inputProps={{
            value,
            placeholder,
            onChange,
            type: 'search',
            autoFocus: false,
            id,
          }}
          renderSuggestion={AutocompleteItem}
          styles={{
            autocompleteContainer: {
              overflow: 'hidden',
              borderRadius: '3px',
              background: '#fff',
              zIndex: 1005,
            },
            autocompleteItem: {
              padding: '0',
              margin: '0',
              backgroundColor: 'transparent',
            },
            autocompleteItemActive: {
              backgroundColor: '#eee',
            },
          }}
          onSelect={this.handleSelect}
        />
      </Container>
    );
  }
}

export default LocationInput;
