import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import messages from '../views/messages';
import styled from 'styled-components';

const ExportLabel = ({ labelId, action, loading, error, className }) => (<button
  onClick={() => action()}
  className={className}
>
  {!loading && <FormattedMessage {...messages[labelId]} />}
  {loading && <FormattedMessage {...messages.processingDownload} />}
  {error && <FormattedMessage {...messages.downloadError} />}
</button>);

ExportLabel.propTypes = {
  className: PropTypes.string,
  labelId: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

export default styled(ExportLabel)`
  display: block;
  font-family: CircularStd-Boo !important;
  font-size: 18px;
  text-align: right;
  color: #222222;
  width: 100%;
`;
