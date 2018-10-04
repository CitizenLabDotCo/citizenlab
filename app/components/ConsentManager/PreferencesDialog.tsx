import React, { PureComponent, Fragment } from 'react';
import styled from 'styled-components';

import Button from 'components/UI/Button';
import ControlledRadio from 'components/UI/ControlledRadio';

import { IDestination } from './';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import { colors, fontSizes, media } from 'utils/styleUtils';
import { transparentize } from 'polished';

export const ContentContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  margin-right: 20px;
  h1 {
    font-size: ${fontSizes.medium}px;
  }
  h2 {
    font-size: ${fontSizes.large}px;
  }
`;

const Scroll = styled.div`
overflow-x: auto;
margin-top: 16px;
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  button {
    margin : 4px;
  }
  Button.button.primary-inverse {
    border-color: ${props => props.theme.colorMain};
  }
`;

const Block = styled.div`
  display: flex;
  padding: 20px;
  border-radius: 5px;
  background-color: rgba(50, 182, 122, 0.06);
  border: 1px solid ${colors.separation};
`;

const TextContainer = styled.div`
  padding: 0 20px;
  p {
    color: ${colors.label}
  }
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  padding-right: 0;
`;

const Separator = styled.span`
  color: ${colors.label};
  font-weight: 400;
  font-size: ${fontSizes.base}px;
  line-height: 19px;
  padding-left: 10px;
  padding-right: 10px;

  ${media.smallerThanMaxTablet`
    padding-left: 8px;
    padding-right: 8px;
  `}
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

export default class PreferencesDialog extends PureComponent<Props> {
  static displayName = 'PreferencesDialog';

  render() {
    const {
      onCancel,
    } = this.props;

    return (
      <ContentContainer>
        <FormattedMessage {...messages.title} tagName="h1" />
        <Scroll>
          {this.renderCategories()}
        </Scroll>
        <Spacer />
        <ButtonContainer>
          <Button onClick={onCancel} style="primary-inverse">
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button
            onClick={this.handleSave}
            style="primary"
            disabled={!this.validate()}
          >
            <FormattedMessage {...messages.save} />
          </Button>
        </ButtonContainer>
      </ContentContainer>
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
    const destinations = this.props.categoryDestinatons[category];
    const checked = this.props[category];
    return (
      <Block key={category}>
        <TextContainer>
          <FormattedMessage
            tagName="h2"
            {...messages[category]}
          />
          <FormattedMessage
            tagName="p"
            {...messages[`${category}Purpose`]}
          />
          <p>
            <FormattedMessage {...messages.tools} />{' : '}
            {destinations.map((d, index) => (
              <Fragment key={d.id}>
                {index !== 0 &&
                  <Separator>•</Separator>
                }
                <a href={d.website} target="_blank">
                  {d.name}
                </a>
              </Fragment>
            ))}
          </p>
        </TextContainer>
        <InputContainer>
          <ControlledRadio
            isChecked={checked === true}
            value="true"
            label={<FormattedMessage {...messages.allow} />}
            onChange={this.handleChange}
            aria-label={`Allow ${category} tracking`}
            name={category}
          />
          <ControlledRadio
            isChecked={checked === false}
            value="false"
            label={<FormattedMessage {...messages.disallow} />}
            onChange={this.handleChange}
            aria-label={`Disallow ${category} tracking`}
            name={category}
          />
        </InputContainer>
      </Block>
    );
  }

  handleChange = e => {
    const { onChange } = this.props;

    onChange(e.target.name, e.target.value === 'true');
  }
  validate = () => {
    const { categoryDestinatons } = this.props;
    let res = true;
    for (const category of Object.keys(categoryDestinatons)) {
      if (categoryDestinatons[category].length > 0) {
        res = res && !(this.props[category] === null);
      }
    }
    return res;
  }
  handleSave = e => {
    const { onSave } = this.props;

    e.preventDefault();

    // Safe guard against browsers that don't prevent the
    // submission of invalid forms (Safari < 10.1)
    if (!this.validate()) {
      return;
    }

    onSave();
  }
}
