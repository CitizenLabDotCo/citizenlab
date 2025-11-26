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

// import { ChartAccessibilityProvider } from './../ChartWidgets/_shared/ChartAccessibilityContext';
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

  // Create localized accessibility props for the chart and inject them into children
  const chartId = React.useId();
  const descriptionId = `${chartId}-description`;
  const localizedAriaLabel = ariaLabel ? localize(ariaLabel) : undefined;
  const localizedDescription = description ? localize(description) : undefined;
  const chartAriaLabel =
    localizedAriaLabel || (title ? localize(title) : undefined);

  const chartAriaDescribedBy = localizedDescription ? descriptionId : undefined;
  const accessibilityProps = {
    ariaLabel: chartAriaLabel,
    ariaDescribedBy: chartAriaDescribedBy,
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, accessibilityProps);
    }
    return child;
  });

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
      <Box>{childrenWithProps}</Box>
      {localizedDescription && (
        <Text color="grey700" fontSize="s" id={descriptionId}>
          {formatMessage(messages.description)} {localizedDescription}
        </Text>
      )}
    </Container>
  );
};

export default Card;
