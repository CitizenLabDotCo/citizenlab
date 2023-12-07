import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

// hooks
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';
import useLocalize from 'hooks/useLocalize';

// typings
import { Multiloc } from 'typings';

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
  title?: Multiloc;
}

const Container = ({ pagebreak, children, ...props }: ContainerProps) => {
  return pagebreak ? (
    <PageBreakBox {...props}>{children}</PageBreakBox>
  ) : (
    <Box {...props}>{children}</Box>
  );
};

const Card = ({ title, children, ...rest }: Props) => {
  const px = useReportDefaultPadding();
  const localize = useLocalize();

  return (
    <Container className="report-widget-card" px={px} {...rest}>
      {title && (
        <Title variant="h3" color="primary" mb="8px">
          {localize(title)}
        </Title>
      )}
      <Box>{children}</Box>
    </Container>
  );
};

export default Card;
