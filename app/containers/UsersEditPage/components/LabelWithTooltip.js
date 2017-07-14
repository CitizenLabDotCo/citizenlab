import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'semantic-ui-react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import messages from '../messages';
import styled from 'styled-components';
import * as tooltipIcon from '../icons/tooltip_tmp.png';

const LabelStyled = styled(FormattedMessage)`
  font-weight: ${(props) => props.isBold ? 'bold' : 'normal'};
`;

const TooltipStyled = styled(Image)`
  // TODO
`;

// eslint-disable-next-line no-unused-vars
const LabelWithTooltip = ({ className, id, hasTooltip, intl, isBold }) => (<div className={className}>
  <LabelStyled
    {...messages[id]}
    isBold
  />
  {hasTooltip && <TooltipStyled
    src={tooltipIcon}
    title={intl.formatMessage(messages[`${id}_tooltip`])}
  />}
</div>);

LabelWithTooltip.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  hasTooltip: PropTypes.bool,
  isBold: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(styled(LabelWithTooltip)`
  // TODO
`);
