import * as React from 'react';
import * as _ from 'lodash';
import * as ReactSelect from 'react-select';
import { IOption } from 'typings';
import styledComponents from 'styled-components';
const styled = styledComponents;

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

interface ISelect {
  value: IOption | null;
  placeholder: string;
  options: IOption[] | null;
  autoBlur?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  onChange: (arg: IOption) => void;
}

const emptyArray = [];

const Select: React.SFC<ISelect> = ({ value, placeholder, options, autoBlur, clearable, searchable, onChange }) => {
  const handleOnChange = (newValue: IOption) => {
    onChange(newValue);
  };

  options = (options || emptyArray);
  autoBlur = (_.isBoolean(autoBlur) ? autoBlur : true);
  clearable = (_.isBoolean(clearable) ? clearable : true);
  searchable = (_.isBoolean(searchable) ? searchable : false);

  return (
    <StyledSelect
      openOnFocus={true}
      clearable={clearable}
      searchable={searchable}
      scrollMenuIntoView={false}
      autoBlur={autoBlur}
      value={(value || undefined)}
      placeholder={placeholder}
      options={options || emptyArray}
      onChange={handleOnChange}
    />
  );
};

export default Select;
