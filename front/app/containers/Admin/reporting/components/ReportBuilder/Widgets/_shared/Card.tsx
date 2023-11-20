import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

interface ContainerProps {
  pagebreak?: boolean;
  'data-testid'?: string;
  className?: string;
  children: React.ReactNode;
}

interface Props extends ContainerProps {
  title?: string;
}

const Container = ({ pagebreak, children, ...props }: ContainerProps) => {
  return pagebreak ? (
    <PageBreakBox {...props}>{children}</PageBreakBox>
  ) : (
    <Box {...props}>{children}</Box>
  );
};

const Card = ({ title, children, ...rest }: Props) => (
  <Container {...rest} className="report-widget-card">
    <Title variant="h3" color="primary" mb="8px">
      {title}
    </Title>
    <Box>{children}</Box>
  </Container>
);

export default Card;
