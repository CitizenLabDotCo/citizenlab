import React, { Fragment, FormEvent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { transparentize, hideVisually } from 'polished';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import { CustomRadio, Checked } from 'components/UI/Radio';

const Container = styled.div`
  display: flex;
  padding: 20px;
  border-radius: 5px;
  background-color: ${transparentize(.95, colors.adminTextColor)};;
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
const StyledInput = styled.input`
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
    margin-bottom: 4px;
  }
  input {
    cursor: pointer;
  }
  &:focus-within, &:hover {
    color: black;
    div {
      border-color: black;
    }
  }
`;
// Typing
import { IDestination } from './';
interface Props {
  category: string;
  destinations: IDestination[];
  checked: boolean;
  onChange: (category: string, value: boolean) => void;
  handleChange: (e: FormEvent<HTMLInputElement>) => (void);
}

const CategoryCard = ({ category, destinations, checked, handleChange }: Props) => (
  <Container>
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
            {d.name}
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
        <StyledInput
          type="radio"
          name={category}
          id={`${category}-radio-true`}
          value="true"
          checked={checked === true}
          aria-checked={checked === true}
          onChange={handleChange}
          required
        />
        <CustomRadio
          className={`${checked === true ? 'checked' : ''}`}
        >
          {checked === true && <Checked color="#49B47D" />}
        </CustomRadio>
        <FormattedMessage {...messages.allow} />
      </StyledLabel>
      <StyledLabel htmlFor={`${category}-radio-false`}>
        <StyledInput
          type="radio"
          name={category}
          id={`${category}-radio-false`}
          value="false"
          checked={checked === false}
          aria-checked={checked === false}
          onChange={handleChange}
          required
        />
        <CustomRadio
          className={`${checked === false ? 'checked' : ''}`}
        >
          {checked === false && <Checked color="#49B47D" />}
        </CustomRadio>
        <FormattedMessage {...messages.disallow} />
      </StyledLabel>
    </InputContainer>
  </Container>
);

export default CategoryCard;
