import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

// hooks
import usePxReport from 'containers/Admin/reporting/hooks/usePxReports';

interface SharedProps {
  pagebreak?: boolean;
  'data-testid'?: string;
  children: React.ReactNode;
}

interface ContainerProps extends SharedProps {
  className?: string;
  px?: string;
}

interface Props extends SharedProps {
  title?: string;
}

const Container = ({ pagebreak, children, ...props }: ContainerProps) => {
  return pagebreak ? (
    <PageBreakBox {...props}>{children}</PageBreakBox>
  ) : (
    <Box {...props}>{children}</Box>
  );
};

const Card = ({ title, children, ...rest }: Props) => {
  const px = usePxReport();

  return (
    <Container className="report-widget-card" px={px} {...rest}>
      <Title variant="h3" color="primary" mb="8px">
        {title}
      </Title>
      <Box>{children}</Box>
    </Container>
  );
};

export default Card;
