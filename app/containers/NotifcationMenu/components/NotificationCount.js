import React from 'react';
import { Image } from 'semantic-ui-react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const NotificationCount = ({ count }) => (<div>
  <Image src={'TODO'} />
  {count}
</div>);

NotificationCount.propTypes = {
  count: PropTypes.number.isRequired,
};

export default styled(NotificationCount)`
  // TODO
`;
