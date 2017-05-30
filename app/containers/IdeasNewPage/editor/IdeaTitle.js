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

function IdeaTitle(props) {
  const { className, setTitle } = props;

  return (
    <Input
      type="text"
      className={className}
      onChange={setTitle}
    />
  );
}

IdeaTitle.propTypes = {
  setTitle: PropTypes.func.isRequired,
  className: PropTypes.string,
};

TitleStatusWrapper.propTypes = {
  long: PropTypes.bool.isRequired,
  short: PropTypes.bool.isRequired,
  length: PropTypes.number.isRequired,
};

export default styled(IdeaTitle)`
  width: 100%;
  height: 36px;
  border: 1px solid #CCE2FF;
  font-stretch: normal;
  font-family: 'proxima-nova';
  letter-spacing: normal;
  font-style: normal;
  line-height: 1.5;
  color: #303839;
  font-size: 24px;
  font-weight: normal;
`;
