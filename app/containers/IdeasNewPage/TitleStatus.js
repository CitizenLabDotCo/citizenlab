import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

function TitleStatus(props) {
  const { className, short, long, length } = props;

  return (
    <div className={className}>
      {short && <FormattedMessage {...messages.shortTitleError} />}
      {long && <FormattedMessage {...messages.longTitleError} />}
      {!(short || long) &&
        <FormattedMessage
          {...messages.charactersLeft}
          values={{ charsLeft: 120 - length }}
        />
      }
    </div>
  );
}

TitleStatus.propTypes = {
  className: PropTypes.string,
  short: PropTypes.bool.isRequired,
  long: PropTypes.bool.isRequired,
  length: PropTypes.number.isRequired,
};

export default styled(TitleStatus)`
  width: 75px;
  height: 16px;
  font-stretch: normal;
  font-family: OpenSans;
  text-align: left;
  letter-spacing: normal;
  font-style: normal;
  line-height: 1.6;
  color: #e74c3c;
  font-size: 10px;
  font-weight: normal;
`;
