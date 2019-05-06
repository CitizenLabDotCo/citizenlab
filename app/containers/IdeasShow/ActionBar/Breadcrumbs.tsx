import React from 'react';
import styled from 'styled-components';

// components
import Icon from 'components/UI/Icon';

const HomeIcon = styled(Icon)`
  height: 14px;
`;

const Breadcrumbs = () => {
  return (
    <HomeIcon name="home" />
  );
};

export default Breadcrumbs;
