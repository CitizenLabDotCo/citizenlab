import React from 'react';

// styling
import { BORDER } from '../constants';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

interface ContainerProps {
  pagebreak?: boolean;
  'data-testid'?: string;
  children: React.ReactNode;
}

interface Props extends ContainerProps {
  title?: string;
}

const Container = ({ pagebreak, children, ...rest }: ContainerProps) => {
  const props = {
    border: BORDER,
    mt: '4px',
    mb: '4px',
    ...rest,
  };

  return pagebreak ? (
    <PageBreakBox {...props}>{children}</PageBreakBox>
  ) : (
    <Box {...props}>{children}</Box>
  );
};

const Card = ({ title, children, ...rest }: Props) => (
  <Container {...rest}>
    <Box>
      <Title variant="h3" color="primary" m="16px" mb="8px">
        {title}
      </Title>
    </Box>
    {children}
  </Container>
);

export default Card;
