import React from 'react';

import {
  Box,
  Title,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
interface SharedProps {
  pagebreak?: boolean;
  'data-testid'?: string;
  className?: string;
  children: React.ReactNode;
}

interface ContainerProps extends SharedProps {
  className?: string;
  px?: string;
}

interface Props extends SharedProps {
  title?: Multiloc;
  ariaLabel?: Multiloc;
  description?: Multiloc;
  infoTooltipContent?: React.ReactNode;
}

const Container = ({ pagebreak, children, ...props }: ContainerProps) => {
  return pagebreak ? (
    <PageBreakBox {...props}>{children}</PageBreakBox>
  ) : (
    <Box {...props}>{children}</Box>
  );
};

const Card = ({ title, infoTooltipContent, children, ...rest }: Props) => {
  const localize = useLocalize();

  return (
    <Container className="report-widget-card" {...rest}>
      {title && (
        <Box display="flex" flexDirection="row" alignItems="center" mb="16px">
          <Title variant="h4" mt="0px" mb="0px">
            {localize(title)}
          </Title>
          {infoTooltipContent && (
            <IconTooltip
              content={
                <Text m="0px" mb="0px" fontSize="s">
                  {infoTooltipContent}
                </Text>
              }
              ml="8px"
              theme="light"
              transform="translate(0,1)"
            />
          )}
        </Box>
      )}
      <Box>{children}</Box>
    </Container>
  );
};

export default Card;
