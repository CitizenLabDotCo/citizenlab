import React, { PureComponent } from 'react';

// Components
import CategoryCard from './CategoryCard';

// Typing
import { CategorizedDestinations, IPreferences } from '.';

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
  categoryDestinations: CategorizedDestinations;
  preferences: IPreferences;
}

const doNothing = () => () => {};

export default class PreferencesDialog extends PureComponent<Props> {
  static displayName = 'PreferencesDialog';

  handleChange = (category: string, value: boolean) => (_event) => {
    this.props.onChange(category, value);
  };

  render() {
    const { categoryDestinations, preferences } = this.props;
    return (
      <ContentContainer id="e2e-preference-dialog">
        {Object.keys(categoryDestinations).map((category) => {
          if (categoryDestinations[category].length > 0) {
            return (
              <CategoryCard
                key={category}
                category={category}
                destinations={categoryDestinations[category]}
                checked={preferences[category]}
                handleChange={this.handleChange}
              />
            );
          }
          return;
        })}
        <CategoryCard
          key={'required'}
          category={'required'}
          destinations={[]}
          checked={true}
          handleChange={doNothing}
          disableUncheck={true}
        />
      </ContentContainer>
    );
  }
}
