import React, { PureComponent } from 'react';

// Components
import Button from 'components/UI/Button';
import CategoryCard from './CategoryCard';

// Typing
import { IDestination } from './';

// Translation
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Styling
import styled from 'styled-components';
import { fontSizes, media, colors } from 'utils/styleUtils';
import { darken } from 'polished';

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
  ${media.smallerThanMaxTablet`
    margin: 0;
  `}
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
  Button.button.primary-inverse span {
    color: ${colors.adminTextColor}
  }
  Button.button.primary:not(.disabled) {
    background-color: ${colors.adminTextColor};
    &:hover, &:focus {
      background-color: ${darken(0.1, colors.adminTextColor)};
    }
  }
`;

interface Props {
  onCancel: () => void;
  onSave: () => void;
  onChange: (category, value) => void;
  categoryDestinations: {
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

  validate = () => {
    const { categoryDestinations } = this.props;
    let res = true;
    for (const category of Object.keys(categoryDestinations)) {
      if (categoryDestinations[category].length > 0) {
        res = res && !(this.props[category] === null);
      }
    }
    return res;
  }

  handleSave = e => {
    const { onSave } = this.props;

    e.preventDefault();

    if (!this.validate()) {
      return;
    }

    onSave();
  }

  handleChange = (e) => {
    this.props.onChange(e.target.name, e.target.value === 'true');
  }

  render() {
    const {
      onCancel,
      categoryDestinations,
      functional,
      advertising,
      analytics,
    } = this.props;
    const checkCategories = { analytics, advertising, functional };
    return (
      <ContentContainer role="dialog" aria-modal>
        <FormattedMessage {...messages.title} tagName="h1" />
        <Scroll>
          {Object.keys(categoryDestinations).map((category) => {
            if (categoryDestinations[category].length > 0) {
              return (
                <CategoryCard
                  key={category}
                  category={category}
                  destinations={categoryDestinations[category]}
                  checked={checkCategories[category]}
                  handleChange={this.handleChange}
                />
              );
            }
            return;
          })}
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
}
