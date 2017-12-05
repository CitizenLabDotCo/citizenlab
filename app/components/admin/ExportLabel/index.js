/*
Link that is used to export data, displayed at the top right in e.g. admin/ideas and admin/users pages
*/

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';

const ExportLabel = ({ action, loading, error, className, children }) => (
  <button
    onClick={() => action()}
    className={className}
  >
    {!loading && children}
    {loading && <FormattedMessage {...messages.processingDownload} />}
    {error && <FormattedMessage {...messages.downloadError} />}
  </button>
);

ExportLabel.propTypes = {
  className: PropTypes.string,
  action: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  children: PropTypes.element,
};

export default styled(ExportLabel)`
  display: block;
  font-size: 18px;
  color: #222222;
`;
