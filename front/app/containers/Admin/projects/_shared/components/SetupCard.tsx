import React, { ReactNode } from 'react';

import Banner from 'design-system/Banner';
import Disclosure from 'design-system/Disclosure';
import ReviewStatus from 'design-system/ReviewStatus';
import tooltipMessages from 'design-system/Tooltip/messages';
import TooltipMark from 'design-system/Tooltip/TooltipMark';

import { SetupReviewCard } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import reviewMessages from './messages';
import styles from './SetupCard.module.css';
import SetupCardButton, { CardButton } from './SetupCardButton';
import { useSetupReview } from './SetupReview';
import { SummaryReviewedContext } from './SummaryPill';
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

  const summary = action && (
    <SummaryReviewedContext.Provider value={reviewed}>
      {action}
    </SummaryReviewedContext.Provider>
  );

  const staticTitle = titleTooltip ? (
    <span className={styles.titleRow}>
      {title}
      <TooltipMark
        label={formatMessage(tooltipMessages.moreInformationAbout, {
          subject: title,
        })}
        content={titleTooltip}
        className={styles.infoMark}
      />
    </span>
  ) : (
    title
  );

  const card = button ? (
    <SetupCardButton
      title={title}
      titleTooltip={titleTooltip}
      staticTitle={staticTitle}
      status={status}
      action={summary}
      button={button}
    >
      {children}
    </SetupCardButton>
  ) : (
    <Disclosure
      header="static"
      title={staticTitle}
      status={status}
      actions={summary}
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
