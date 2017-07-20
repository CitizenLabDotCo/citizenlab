import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import styled from 'styled-components';

const StyledMultipleSelect = styled(Select)`
  &.Select--multi {
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
      height: auto;
      margin: 0px;
      padding: 5px;
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

      .Select-multi-value-wrapper {
        width: calc(100% - 30px);
        height: auto;
        margin: 0px;
        padding: 0px;
        position: relative;

        .Select-placeholder {
          color: #aaa;
          font-size: 17px;
          font-weight: 400;
          line-height: 36px;
          padding: 0px;
          padding-bottom: 1px;
          margin: 0px;
          margin-left: 6px;
          position: absolute;
          top: 0px;
          bottom: 0px;
          left: 0px;
          display: flex;
          align-items: center;
        }

        .Select-input {
          height: auto;
          font-size: 17px;
          font-weight: 400;
          line-height: 36px;
          padding: 0px;
          margin: 0px;
          margin-left: 6px;

          > input {
            height: 100%;
            padding: 0px;
            margin: 0px;
          }
        }

        .Select-value {
          height: auto;
          display: inline-flex;
          align-items: center;
          padding: 0px;
          margin: 0px;
          margin-right: 5px;
          margin-bottom: 5px;
          border: none;
          border-radius: 5px;
          overflow: hidden;
          cursor: pointer;
          background: ${(props) => props.theme.color.main || '#777'};

          &:last-child {
            margin-right: 0px;
          }

          .Select-value-icon {
            color: #fff;
            width: auto;
            height: 100%;
            font-size: 22px;
            font-weight: 300;
            border: none;
            border-radius: 0;
            padding: 0px;
            padding-bottom: 2px;
            padding-left: 8px;
            padding-right: 8px;
            margin: 0px;
            border: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            opacity: 0.8;

            &:hover {
              opacity: 1;
            }
          }

          .Select-value-label {
            color: #fff;
            font-size: 16px;
            font-weight: 400;
            line-height: 34px;
            white-space: nowrap;
            border: none;
            border-radius: 0;
            padding: 0;
            padding-top: 0px;
            padding-bottom: 2px;
            padding-left: 4px;
            padding-right: 10px;
            margin: 0;
            cursor: pointer;
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
          font-weight: 400;
          padding: 14px 12px;
        }
      }
    }
  }
`;

const emptyArray = [];

const MultipleSelect = ({ value, placeholder, options, max, autoBlur, onChange }) => {
  const handleOnChange = (newValue) => {
    onChange((max && newValue && newValue.length > max ? value : newValue));
  };

  return (
    <StyledMultipleSelect
      multi
      searchable
      openOnFocus
      autoBlur={autoBlur}
      backspaceRemoves={false}
      scrollMenuIntoView={false}
      allowCreate={false}
      clearable={false}
      value={value || emptyArray}
      placeholder={<span>{placeholder}</span>}
      options={options || emptyArray}
      onChange={handleOnChange}
    />
  );
};

MultipleSelect.propTypes = {
  value: PropTypes.array,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  max: PropTypes.number,
  autoBlur: PropTypes.bool,
  onChange: PropTypes.func,
};

MultipleSelect.defaultProps = {
  value: [],
  placeholder: '',
  options: [],
  max: null,
  autoBlur: true,
};

export default MultipleSelect;
