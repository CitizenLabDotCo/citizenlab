import React from 'react';

// components
import AuthorSelect from './AuthorSelect';
import { Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { fontSizes, defaultStyles } from 'utils/styleUtils';

// typings
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
  if (['new-user', 'existing-user'].includes(selectedAuthor.userState)) {
    const handleClear = () => {
      onSelect({
        userState: 'no-user',
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
          <StyledIcon
            name="close"
            // position="absolute"
            width="20px"
            height="20px"
            // right="6px"
            // mt="-1px"
          />
        </button>
      </FakeInput>
    );
  }

  return <AuthorSelect selectedAuthor={selectedAuthor} onSelect={onSelect} />;
};

export default AuthorInput;
