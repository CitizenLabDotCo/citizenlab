import React from 'react';
import PropTypes from 'prop-types';
import * as ReactSelect from 'react-select';
import styled from 'styled-components';
import Error from 'components/UI/Error';
import { injectIntl, intlShape } from 'react-intl';
import messages from './messages';

const StyledSelect = styled(ReactSelect)`
  &.Select--single {
    margin: 0;
    padding: 0;

    &:not(.is-open):hover {
      .Select-control {
        border-color: #999;
      }
    }

    &.is-open {
      .Select-control {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;

        .Select-arrow-zone {
          .Select-arrow {
            margin-top: -1px;
            border-width: 0 5px 5px;
          }
        }
      }
    }

    &.is-open,
    &.is-focused {
      .Select-control {
        border-color: #000;
      }
    }

    &.has-value {
      .Select-control {
        padding-bottom: 0px;
      }
    }

    .Select-control {
      width: 100%;
      min-height: 48px;
      margin: 0px;
      padding: 0px;
      display: flex;
      cursor: pointer;
      border-color: #ccc;
      border-radius: 5px;
      position: relative;
      box-shadow: none !important;
      outline: none !important;

      .Select-arrow-zone {
        width: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0px;
        margin: 0px;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;

        .Select-arrow {
          margin-top: 1px;
          height: auto;
          border-width: 5px 5px 2.5px;
        }
      }

      .Select-clear-zone {
        width: 20px;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0px;
        padding-bottom: 3px;
        margin: 0px;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 30px;

        &:hover {
          .Select-clear {
            color: #000;
          }
        }

        .Select-clear {
          font-size: 25px;
        }
      }

      .Select-multi-value-wrapper {
        width: calc(100% - 70px);
        height: auto;
        margin: 0px;
        padding: 0px;
        position: relative;

        .Select-placeholder {
          color: #aaa;
        }

        .Select-placeholder,
        .Select-input,
        .Select-value {
          height: 100%;
          font-size: 17px;
          font-weight: 400;
          line-height: 32px;
          padding: 0px;
          padding-bottom: 1px;
          margin: 0px;
          margin-left: 12px;
          display: flex;
          align-items: center;

          > input {
            display: flex;
            align-items: center;
            height: 100%;
            padding: 0px;
            margin: 0px;
          }
        }
      }
    }

    .Select-menu-outer {
      max-height: 214px;
      border-color: #000;
      border-top: solid 1px #ccc;
      border-radius: 0;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      overflow: hidden;
      z-index: 9999;

      .Select-menu {
        max-height: 212px;

        .Select-option {
          color: #333;
          font-size: 17px;
          font-weight: 400;

          &:hover, 
          &:focus, 
          &:active,
          &.is-focused {
            background: #eee;
          }
        }

        .Select-noresults {
          color: #cc0000;
          font-size: 17px;
          font-weight: 500;
          padding: 14px 12px;
        }
      }
    }
  }
`;

const emptyArray = [];

const Select = ({ value, placeholder, options, autoBlur, clearable, searchable, onChange, error, name, intl }) => {
  const handleOnChange = (newValue) => {
    onChange(newValue, name);
  };

  return (<div>
    <StyledSelect
      openOnFocus
      clearable={clearable}
      searchable={searchable}
      scrollMenuIntoView={false}
      autoBlur={autoBlur}
      value={value}
      placeholder={placeholder}
      options={options || emptyArray}
      onChange={handleOnChange}
      noResultsText={intl.formatMessage(messages.noResults)}
    />
    <Error text={error} />
  </div>);
};

Select.propTypes = {
  intl: intlShape.isRequired,
  name: PropTypes.string,
  value: PropTypes.object,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  autoBlur: PropTypes.bool,
  clearable: PropTypes.bool,
  searchable: PropTypes.bool,
  onChange: PropTypes.func,
  error: PropTypes.string,
};

Select.defaultProps = {
  value: null,
  placeholder: '',
  options: [],
  autoBlur: true,
  clearable: false,
  searchable: false,
};

export default injectIntl(Select);
