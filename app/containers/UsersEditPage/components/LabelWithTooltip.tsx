import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'semantic-ui-react';
import { intlShape } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import * as tooltipIcon from '../icons/tooltip_tmp.png';

const LabelStyled = styled.label`
  display: inline-block;
  font-size: 18px;
  font-weight: ${(props) => props.isBold ? 'bold' : 'normal'};
`;

const TooltipStyled = styled(Image)`
  display: inline-block !important;
  margin-left: 5px;
  height: 17px;
  width: 15px;
`;

// eslint-disable-next-line no-unused-vars
const LabelWithTooltip = ({ className, id, hasTooltip, intl, isBold }) => (<div className={className}>
  <LabelStyled isBold={!!isBold}>
    <FormattedMessage {...messages[id]} />
  </LabelStyled>
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
  padding: 0.5em 0;
`);
