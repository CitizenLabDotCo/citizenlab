import * as React from 'react';
import PlacesAutocomplete, { geocodeByPlaceId } from 'react-places-autocomplete';
import styled from 'styled-components';

const LocationInputWrapper = styled.div`
  width: 100%;

  input {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 26px;
    font-weight: 400;
    padding: 12px;
    border-radius: 5px;
    border: solid 1px #ccc;
    background: #fff;
    outline: none;

    ::placeholder {
      color: #aaa;
      opacity: 1;
    }

    &:not(:focus):hover {
      border-color: #999;
    }

    &:focus {
      border-color: #000;
    }
  }
`;

const StyledAutocompleteItem = styled.div`
  width: 100%;
  color: #999;
  font-size: 17px;
  line-height: 17px;
  font-weight: 400;
  padding: 12px;
  z-index: 2;

  strong {
    color: #000;
    font-weight: 600;
  }

  &:hover {
    background: #eee;
  }
`;

type Props = {
  id?: string;
  value: string;
  placeholder: string;
  onChange: (arg: string) => void;
};

type State = {};

export default class LocationInput extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
  }

  handleOnChange = (value: string) => {
    this.props.onChange(value);
  }

  handleSelect = async (adress: string, placeId: string) => {
    this.props.onChange(adress);
    return geocodeByPlaceId(placeId).then(results => results);
  }

  render() {
    const { id } = this.props;
    let { value, placeholder } = this.props;

    value = (value || '');
    placeholder = (placeholder || '');

    const inputProps = {
      value,
      placeholder,
      onChange: this.handleOnChange,
      type: 'search',
      autoFocus: false,
    };
    const styles = {
      autocompleteContainer: {
        overflow: 'hidden',
        borderRadius: '5px',
        background: '#fff',
        zIndex: '100',
      },
      autocompleteItem: {
        padding: '0',
        margin: '0',
        backgroundColor: 'transparent',
      },
      autocompleteItemActive: {
        backgroundColor: '#eee',
      }
    };

    const AutocompleteItem = ({ formattedSuggestion }) => (
      <StyledAutocompleteItem className="autocompleteItemInner">
        <strong>{formattedSuggestion.mainText}</strong>{' '}{formattedSuggestion.secondaryText}
      </StyledAutocompleteItem>
    );

    return (
      <LocationInputWrapper>
        <PlacesAutocomplete
          id={id}
          highlightFirstSuggestion={true}
          inputProps={inputProps}
          renderSuggestion={AutocompleteItem}
          styles={styles}
          onSelect={this.handleSelect}
        />
      </LocationInputWrapper>
    );
  }
}
