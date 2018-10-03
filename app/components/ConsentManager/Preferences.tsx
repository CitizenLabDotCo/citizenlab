import React, { PureComponent } from 'react';
import styled from 'styled-components';

import Warning from 'components/UI/Warning';
import Button from 'components/UI/Button';

import { IDestination } from './';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Scroll = styled('div')`
  overflow-x: auto;
  margin-top: 16px;
`;

const InputCell = styled.div`
  input {
    vertical-align: middle;
  }
  label {
    display: block;
    margin-bottom: 4px;
    white-space: nowrap;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  button {
    margin : 4px;
  }
  Button.button.primary {
    border-color: white;
  }
`;

interface Props {
  onCancel: () => void;
  onSave: () => void;
  onChange: (category, value) => void;
  categoryDestinatons: {
    analytics: IDestination[];
    advertising: IDestination[];
    functional: IDestination[];
  };
  analytics: boolean | null;
  advertising: boolean | null;
  functional: boolean | null;
}

export default class Preferences extends PureComponent<Props> {
  static displayName = 'Preferences';

  render() {
    const {
      onCancel,
      onSave,
    } = this.props;

    return (
      <>
        <Scroll>
          {this.renderCategories()}
        </Scroll>
        <ButtonContainer>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </ButtonContainer>
      </>
    );
  }
  renderCategories = () => {
    const { categoryDestinatons } = this.props;
    const blocks = [] as JSX.Element[];

    for (const category of Object.keys(categoryDestinatons)) {
      if (categoryDestinatons[category].length > 0) {
        blocks.push(this.renderBlock(category));
      }
    }
    return blocks;
  }

  renderBlock = (category) => {
    const handleChange = e => {
      const { onChange } = this.props;

      onChange(e.target.name, e.target.value === 'true');
    };
    const destinations = this.props.categoryDestinatons[category];
    const checked = this.props[category];
    return (
      <Warning
        key={category}
        text={
          <>
            <FormattedMessage
              {...messages[category]}
            />
            <FormattedMessage
              {...messages[`${category}Purpose`]}
            />
            <InputCell>
              <label>
                <input
                  type="radio"
                  name={category}
                  value="true"
                  checked={checked === true}
                  aria-checked={checked === true}
                  onChange={handleChange}
                  aria-label={`Allow ${category} tracking`}
                  required
                />
                Yes
          </label>
              <label>
                <input
                  type="radio"
                  name={category}
                  value="false"
                  checked={checked === false}
                  aria-checked={checked === false}
                  onChange={handleChange}
                  aria-label={`Disallow ${category} tracking`}
                  required
                />{' '}
                No
          </label>
            </InputCell>
            {destinations.map(d => d.name).join(', ')}
          </>
        }
      />
    );
  }
}
