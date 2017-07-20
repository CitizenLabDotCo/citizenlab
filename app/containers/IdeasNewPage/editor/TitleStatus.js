import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import messages from '../messages';

const Error = ({ message, className }) => (<div className={className}>
  <FormattedMessage {...message} />
</div>);

const ErrorStyled = styled(Error)`
  color: #f00;
`;

function TitleStatus(props) {
  const { className, short, long, length } = props;

  return (
    <div className={className}>
      {short && <ErrorStyled message={messages.shortTitleError} />}
      {long && <ErrorStyled message={messages.longTitleError} />}
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

Error.propTypes = {
  message: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default styled(TitleStatus)`
  font-stretch: normal;
  text-align: left;
  letter-spacing: normal;
  font-style: normal;
  line-height: 1.6;
  font-size: 10px;
  font-weight: normal;
`;
