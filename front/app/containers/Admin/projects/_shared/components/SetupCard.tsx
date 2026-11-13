import React, { ReactNode } from 'react';

import {
  Box,
  IconTooltip,
  Icon,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import { SetupReviewCard } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import reviewMessages from './messages';
import SetupCardButton, { CardButton } from './SetupCardButton';
import { useSetupReview } from './SetupReview';

interface Props {
  title: string;
  reviewKey?: SetupReviewCard;
  reviewNeedsChoice?: boolean;
  titleTooltip?: JSX.Element;
  action?: ReactNode;
  button?: CardButton;
  children?: ReactNode;
}

const SetupCard = ({
  title,
  reviewKey,
  reviewNeedsChoice = false,
  titleTooltip,
  action,
  button,
  children,
}: Props) => {
  const { formatMessage } = useIntl();
  const review = useSetupReview(reviewKey);
  const reviewed = review.reviewed && !reviewNeedsChoice;
  const headerAction = review.enabled ? (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="flex-end"
      gap="8px"
    >
      <Text
        as="span"
        m="0"
        fontSize="xs"
        color={reviewed ? 'green600' : 'coolGrey500'}
        aria-live="polite"
      >
        {reviewed && (
          <Icon
            name="check-circle"
            fill={colors.green600}
            width="16px"
            mr="4px"
          />
        )}
        {formatMessage(
          reviewNeedsChoice
            ? reviewMessages.toSet
            : reviewed
            ? reviewMessages.reviewed
            : reviewMessages.toReview
        )}
      </Text>
      {action}
    </Box>
  ) : (
    action
  );

  return (
    <Box
      as="section"
      data-review-card={review.enabled ? reviewKey : undefined}
      onClickCapture={review.enabled ? review.onReview : undefined}
      display="flex"
      flexDirection="column"
      border={`1px solid ${colors.grey200}`}
      borderRadius={bo.borderRadius}
    >
      {button ? (
        <Box as="h3" m="0">
          <SetupCardButton
            title={title}
            titleTooltip={titleTooltip}
            action={headerAction}
            button={button}
          />
        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="10px"
          minHeight="44px"
          p="8px 8px 8px 12px"
        >
          <Box as="h3" m="0" display="flex" alignItems="center" gap="4px">
            <Text
              as="span"
              variant="boControl"
              fontSize="xs"
              lineHeight="20px"
              m="0"
            >
              {title}
            </Text>
            {titleTooltip && <IconTooltip content={titleTooltip} />}
          </Box>
          {headerAction}
        </Box>
      )}
      {review.enabled && review.isError && (
        <Text role="alert" color="error" m="12px">
          {formatMessage(reviewMessages.failed)}
        </Text>
      )}
      {children && (
        <Box display="flex" flexDirection="column" gap="12px" p="2px 12px 14px">
          {children}
        </Box>
      )}
    </Box>
  );
};

export default SetupCard;
