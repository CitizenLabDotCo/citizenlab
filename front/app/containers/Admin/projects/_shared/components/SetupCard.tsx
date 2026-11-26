import React, { ReactNode } from 'react';

import Banner from 'design-system/Banner';
import Disclosure from 'design-system/Disclosure';
import ReviewStatus from 'design-system/ReviewStatus';
import Tooltip, { TooltipTarget } from 'design-system/Tooltip';

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
  spacedBody?: boolean;
  reviewKey?: SetupReviewCard;
  reviewNeedsChoice?: boolean;
  titleTooltip?: JSX.Element;
  action?: ReactNode;
  button?: CardButton;
  /** A Menu the card header opens. The action then shows the picked value. */
  menu?: ReactNode;
  menuDescribedBy?: string;
  children?: ReactNode;
}

const SetupCard = ({
  title,
  spacedBody,
  reviewKey,
  reviewNeedsChoice = false,
  titleTooltip,
  action,
  button,
  menu,
  menuDescribedBy,
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

  // The title itself opens the explanation; cards carry no info mark.
  const staticTitle = titleTooltip ? (
    <Tooltip content={titleTooltip}>
      <TooltipTarget className={styles.titleTarget}>{title}</TooltipTarget>
    </Tooltip>
  ) : (
    title
  );

  const card = menu ? (
    <>
      <Disclosure
        header="menu"
        title={title}
        tooltip={titleTooltip}
        status={status}
        summary={summary}
        menu={menu}
        aria-describedby={menuDescribedBy}
      />
      {children}
    </>
  ) : button ? (
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
      spacedBody={spacedBody}
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
