import React, { PureComponent } from 'react';

// Components
import CategoryCard from './CategoryCard';

// Typing
import { IDestination } from './';

// Styling
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

export const ContentContainer = styled.div`
  padding: 30px;
  background: white;

  h1 {
    font-size: ${fontSizes.medium}px;
  }

  h2 {
    font-size: ${fontSizes.large}px;
  }

  ${media.smallerThanMinTablet`
    margin: 0;
    padding: 20px;
  `}
`;

interface Props {
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

  handleChange = (category: string, value: boolean) => (_event) => {
    this.props.onChange(category, value);
  }

  render() {
    const {
      categoryDestinations,
      functional,
      advertising,
      analytics,
    } = this.props;
    const checkCategories = { analytics, advertising, functional };
    return (
      <ContentContainer id="e2e-preference-dialog">
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
      </ContentContainer>
    );
  }
}
