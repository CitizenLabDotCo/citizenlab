import * as React from 'react';
import * as PlacesAutocomplete from 'react-places-autocomplete';
import styledComponents from 'styled-components';
const styled = styledComponents;

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
  z-index: 9999;

  strong {
    color: #000;
    font-weight: 600;
  }

  &:hover {
    background: #eee;
  }
`;

const emptyString = '';

const LocationInput: React.SFC<ILocationInput> = ({ id, value, placeholder, onChange }) => {
  const handleOnChange = (address: string) => {
    onChange(address);
  };

  const inputProps = {
    value: (value || emptyString),
    placeholder: (placeholder || emptyString),
    onChange: handleOnChange,
    type: 'search',
    autoFocus: true,
  };

  const AutocompleteItem = ({ formattedSuggestion }) => ( // eslint-disable-line
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
        autocompleteItem={AutocompleteItem}
        styles={{
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
          },
        }}
      />
    </LocationInputWrapper>
  );
};

interface ILocationInput {
  id?: string;
  value: string;
  placeholder: string;
  onChange: (arg: string) => void;
}

export default LocationInput;
