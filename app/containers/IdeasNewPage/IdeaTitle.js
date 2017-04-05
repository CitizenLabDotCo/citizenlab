import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { Row, Column } from 'components/Foundation';
import TitleStatus from './TitleStatus';

export const TitleStatusWrapper = (props) => (
  <TitleStatus
    short={props.short}
    long={props.long}
    length={props.length}
  />
);

function IdeaTitle(props) {
  const { className, setTitle, short, long, length } = props;

  return (
    <div>
      <Row>
        <Column large={9}>
          <input
            type="text"
            className={className}
            onChange={setTitle}
          />
        </Column>
        <Column large={3}>
          <TitleStatusWrapper
            short={short}
            long={long}
            length={length}
          />
        </Column>
      </Row>
    </div>
  );
}

IdeaTitle.propTypes = {
  setTitle: PropTypes.func.isRequired,
  className: PropTypes.string,
  long: PropTypes.bool.isRequired,
  short: PropTypes.bool.isRequired,
  length: PropTypes.number.isRequired,
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
  font-family: OpenSans;
  letter-spacing: normal;
  font-style: normal;
  line-height: 1.5;
  color: #303839;
  font-size: 24px;
  font-weight: normal;
`;
