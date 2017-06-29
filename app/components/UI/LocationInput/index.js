import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlacesAutocomplete from 'react-places-autocomplete';

const LocationInputWrapper = styled.div`
  width: 100%;

  input {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 22px;
    font-weight: 300;
    padding: 12px;
    border-radius: 5px;
    border: solid 1px #ccc;
    background: #fff;
    outline: none;

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
  font-weight: 300;
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

const LocationInput = ({ value, placeholder, onChange }) => {
  const handleOnChange = (address) => {
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
        highlightFirstSuggestion
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

LocationInput.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
};

LocationInput.defaultProps = {
  value: '',
  placeholder: '',
};

export default LocationInput;
