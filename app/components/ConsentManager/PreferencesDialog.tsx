import React, { PureComponent, Fragment } from 'react';

// Components
import Button from 'components/UI/Button';

// Typing
import { IDestination } from './';

// Translation
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { transparentize, hideVisually } from 'polished';

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
  flex-shrink: 0;
  margin-top: 10px;
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
  background-color: ${props => transparentize(.95, props.theme.colorMain)};;
  border: 1px solid ${colors.separation};
  margin-bottom: 10px;
  margin-right: 10px;
  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
  `}
`;

const TextContainer = styled.div`
  padding: 0 20px;
  p {
    color: ${colors.label}
  }
  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  padding-right: 0;
  ${media.smallerThanMaxTablet`
    margin-top: 20px;
  `}
`;

const HiddenLabel = styled.label`
  ${hideVisually()}
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

const StyledLabel = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: nowrap;
  font-size: ${fontSizes.base}px;
  color: ${colors.label};
  cursor: pointer;
  font-weight: 400;
  span {
    margin-left: 5px;
    margin-bottom: 4px;
  }
  input {
    cursor: pointer;
  }
  &:focus-within, &:hover {
    color: black;
    input {
      border: 1px solid hsl(0, 0%, 66%);
    }
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

export default class PreferencesDialog extends PureComponent<Props> {
  static displayName = 'PreferencesDialog';

  render() {
    const {
      onCancel,
    } = this.props;

    return (
      <ContentContainer role="dialog" aria-modal>
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
            id={`${category}-label`}
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
                <a href={d.website} target="_blank" tabIndex={-1}>
                  {d.name}
                </a>
              </Fragment>
            ))}
          </p>
        </TextContainer>
        <InputContainer role="radiogroup" aria-labelledby={`${category}-radio`}>
          <HiddenLabel id={`${category}-radio`}>
            <FormattedMessage
              {...messages.ariaRadioGroup}
              values={{ category }}
            />
          </HiddenLabel>
          <StyledLabel htmlFor={`${category}-radio-true`}>
            <input
              type="radio"
              name={category}
              id={`${category}-radio-true`}
              value="true"
              checked={checked === true}
              aria-checked={checked === true}
              onChange={this.handleChange}
              required
            />
            <FormattedMessage {...messages.allow} />
          </StyledLabel>
          <StyledLabel htmlFor={`${category}-radio-false`}>
            <input
              type="radio"
              name={category}
              id={`${category}-radio-false`}
              value="false"
              checked={checked === false}
              aria-checked={checked === false}
              onChange={this.handleChange}
              required
            />
            <FormattedMessage {...messages.disallow} />
          </StyledLabel>
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
