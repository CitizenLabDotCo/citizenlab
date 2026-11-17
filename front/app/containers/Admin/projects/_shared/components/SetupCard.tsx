import React, { ReactNode } from 'react';

import { Button as AriaButton } from 'react-aria-components';

import { SetupReviewCard } from 'api/phases/types';

import Banner from 'design-system/Banner';
import Disclosure from 'design-system/Disclosure';
import Icon from 'design-system/Icon';
import ReviewStatus from 'design-system/ReviewStatus';
import Tooltip from 'design-system/Tooltip';

import { useIntl } from 'utils/cl-intl';

import reviewMessages from './messages';
import styles from './SetupCard.module.css';
import SetupCardButton, { CardButton } from './SetupCardButton';
import { useSetupReview } from './SetupReview';
import 'design-system/tokens.css';

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
  const status = review.enabled ? (
    <span aria-live="polite">
      <ReviewStatus
        status={
          reviewNeedsChoice ? 'toSet' : reviewed ? 'reviewed' : 'toReview'
        }
      />
    </span>
  ) : undefined;

  const card = button ? (
    <SetupCardButton
      title={title}
      titleTooltip={titleTooltip}
      status={status}
      action={action}
      button={button}
    >
      {children}
    </SetupCardButton>
  ) : (
    <Disclosure
      header="static"
      title={
        titleTooltip ? (
          <span className={styles.titleRow}>
            {title}
            <Tooltip content={titleTooltip}>
              <AriaButton className={styles.infoButton} aria-label={title}>
                <Icon name="info-16" />
              </AriaButton>
            </Tooltip>
          </span>
        ) : (
          title
        )
      }
      status={status}
      actions={action}
    >
      {children}
    </Disclosure>
  );

  if (!review.enabled) return card;

  return (
    // Any click inside the card counts as reviewing it, including clicks
    // that a control inside handles itself.
    <section
      className={styles.review}
      data-review-card={reviewKey}
      onClickCapture={reviewNeedsChoice ? undefined : review.onReview}
    >
      {card}
      {review.isError && (
        <Banner tone="error">{formatMessage(reviewMessages.failed)}</Banner>
      )}
    </section>
  );
};

export default SetupCard;
