import React, { Fragment, FormEvent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { transparentize } from 'polished';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Radio } from 'cl2-component-library';
import { IDestination } from './';

const Container = styled.div`
  display: flex;
  padding: 20px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background-color: ${transparentize(0.95, colors.adminTextColor)};
  border: 1px solid ${colors.separation};
  margin-bottom: 10px;

  &:last-child {
    margin: 0;
  }

  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
  `}
`;

const TextContainer = styled.div`
  padding: 0 20px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  p {
    color: ${colors.label};
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const StyledFieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  margin-bottom: 10px;
  border: none;
`;

const Separator = styled.span`
  color: ${colors.label};
  font-weight: 400;
  font-size: ${fontSizes.base}px;
  line-height: 19px;
`;

const SSpan = styled.span`
  padding-left: 10px;
  padding-right: 10px;

  ${media.smallerThanMaxTablet`
    padding-left: 8px;
    padding-right: 8px;
`}
`;

const Tools = styled.span`
  font-weight: 500;
`;

interface Props {
  category: string;
  destinations: IDestination[];
  checked: boolean;
  handleChange: (
    category: string,
    value: boolean
  ) => (e: FormEvent<HTMLInputElement>) => void;
}

const CategoryCard = ({
  category,
  destinations,
  checked,
  handleChange,
}: Props) => (
  <Container className="e2e-category">
    <TextContainer>
      <FormattedMessage
        id={`${category}-label`}
        tagName="h2"
        {...messages[category]}
      />
      <StyledFieldset>
        <Radio
          onChange={handleChange(category, true)}
          currentValue={checked}
          value={true}
          name={category}
          id={`${category}-radio-true`}
          label={<FormattedMessage {...messages.allow} />}
          isRequired
        />
        <Radio
          onChange={handleChange(category, false)}
          currentValue={checked}
          value={false}
          name={category}
          id={`${category}-radio-false`}
          label={<FormattedMessage {...messages.disallow} />}
          isRequired
        />
      </StyledFieldset>
      <FormattedMessage tagName="p" {...messages[`${category}Purpose`]} />
      <p>
        <Tools>
          <FormattedMessage {...messages.tools} />:
        </Tools>
        {destinations.map((d, index) => (
          <Fragment key={d.id}>
            {index !== 0 && <Separator>•</Separator>}
            <SSpan>{d.name}</SSpan>
          </Fragment>
        ))}
      </p>
    </TextContainer>
  </Container>
);

export default CategoryCard;
