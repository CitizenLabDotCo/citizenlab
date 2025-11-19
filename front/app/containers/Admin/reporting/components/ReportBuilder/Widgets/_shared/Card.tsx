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

import { useIntl } from 'utils/cl-intl';

import { ChartAccessibilityProvider } from './../ChartWidgets/_shared/ChartAccessibilityContext';
import messages from './messages';

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

const Card = ({
  title,
  ariaLabel,
  description,
  infoTooltipContent,
  children,
  ...rest
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const chartId = React.useId();
  const descriptionId = `${chartId}-description`;
  const localizedAriaLabel = ariaLabel ? localize(ariaLabel) : undefined;
  const localizedDescription = description ? localize(description) : undefined;

  // Create the ARIA label for charts - use ariaLabel if provided, otherwise use title
  const chartAriaLabel =
    localizedAriaLabel || (title ? localize(title) : undefined);

  // Create the describedBy ID if there's a description
  const chartAriaDescribedBy = localizedDescription ? descriptionId : undefined;

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
      <ChartAccessibilityProvider
        ariaLabel={chartAriaLabel}
        ariaDescribedBy={chartAriaDescribedBy}
      >
        <Box
          role="img"
          aria-label={chartAriaLabel}
          aria-describedby={chartAriaDescribedBy}
        >
          {children}
        </Box>
      </ChartAccessibilityProvider>
      {localizedDescription && (
        <Text color="grey700" fontSize="s" id={descriptionId}>
          {formatMessage(messages.description)} {localizedDescription}
        </Text>
      )}
    </Container>
  );
};

export default Card;
