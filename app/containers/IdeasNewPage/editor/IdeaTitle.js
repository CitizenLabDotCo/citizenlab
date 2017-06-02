import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { Input } from 'semantic-ui-react';

import TitleStatus from './TitleStatus';

export const TitleStatusWrapper = (props) => (
  <TitleStatus
    short={props.short}
    long={props.long}
    length={props.length}
  />
);

const StyledInput = styled(Input)`
  width: 100%;
`;

function IdeaTitle(props) {
  const { setTitle } = props;

  return (
    <StyledInput
      type="text"
      size="medium"
      placeholder="The title of your idea"
      onChange={setTitle}
    />
  );
}

IdeaTitle.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

TitleStatusWrapper.propTypes = {
  long: PropTypes.bool.isRequired,
  short: PropTypes.bool.isRequired,
  length: PropTypes.number.isRequired,
};

export default styled(IdeaTitle)`
  width: 100%;
  height: 36px;
  font-stretch: normal;
  font-family: 'proxima-nova';
  letter-spacing: normal;
  font-style: normal;
  line-height: 1.5;
  color: #303839;
  font-size: 24px;
  font-weight: normal;
`;
