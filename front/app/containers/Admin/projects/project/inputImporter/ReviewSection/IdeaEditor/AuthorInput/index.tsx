import React from 'react';

import {
  Icon,
  fontSizes,
  defaultStyles,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import AuthorSelect from './AuthorSelect';
import { SelectedAuthor } from './typings';

const FakeInput = styled.div`
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  padding: ${defaultStyles.inputPadding};
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ccc;
  outline: none;
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  transition: box-shadow 100ms ease-out;
  width: 100%;
  position: relative;
  opacity: 1;
  color: #666;
  background-color: #f9f9f9;
  cursor: text;
  margin-bottom: 20px;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
  fill: #666;
  &:hover {
    fill: black;
  }
`;

interface Props {
  selectedAuthor: SelectedAuthor;
  onSelect: (selectedAuthor?: SelectedAuthor) => void;
}

const AuthorInput = ({ selectedAuthor, onSelect }: Props) => {
  if (selectedAuthor.email) {
    const handleClear = () => {
      const isValidWithoutEmail =
        selectedAuthor.first_name && selectedAuthor.last_name;
      onSelect({
        user_state: isValidWithoutEmail ? 'new-imported-user' : 'no-user',
        email: undefined,
      });
    };

    return (
      <FakeInput>
        {selectedAuthor.email}
        <button
          style={{
            all: 'unset',
            position: 'absolute',
            right: '8px',
            marginTop: '-2px',
          }}
          onClick={handleClear}
        >
          <StyledIcon name="close" width="20px" height="20px" />
        </button>
      </FakeInput>
    );
  }

  return <AuthorSelect selectedAuthor={selectedAuthor} onSelect={onSelect} />;
};

export default AuthorInput;
