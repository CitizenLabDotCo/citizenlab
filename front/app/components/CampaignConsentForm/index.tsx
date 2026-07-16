import React, { useState, useEffect } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import {
  ICampaignConsentData,
  IConsentChanges,
} from 'api/campaign_consents/types';
import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import useUpdateCampaignConsents from 'api/campaign_consents/useUpdateCampaignConsents';
import { internalCommentNotificationTypes } from 'api/campaigns/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { FormSection } from 'components/UI/FormComponents';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import ChannelConsentSection from './ChannelConsentSection';
import Feedback from './feedback';
import messages from './messages';
import {
  CampaignConsent,
  CampaignConsentChild,
  ConsentGroupView,
} from './typings';
import { groupCampaignsConsent, sortGroupedCampaignConsents } from './utils';

type Props = {
  trackEventName: string;
  runOnSave?: () => void;
  unsubscriptionToken?: string | null;
};

const CampaignConsentForm = ({
  trackEventName,
  runOnSave,
  unsubscriptionToken,
}: Props) => {
  const localize = useLocalize();
  const isInternalCommentingEnabled = useFeatureFlag({
    name: 'internal_commenting',
  });
  const { formatMessage } = useIntl();

  const { data: originalCampaignConsents } = useCampaignConsents({
    unsubscriptionToken,
    withoutCampaignNames: [
      ...(isInternalCommentingEnabled ? [] : internalCommentNotificationTypes),
    ],
  });

  const { mutate: updateCampaignConsents } = useUpdateCampaignConsents();

  const [campaignConsents, setCampaignConsents] = useState<
    Record<string, CampaignConsent>
  >({});

  const [showFeedback, setShowFeedback] = useState<false | 'success' | 'error'>(
    false
  );
  const [loading, setLoading] = useState<boolean>(false);
  const smsEnabled = useFeatureFlag({ name: 'sms' });

  useEffect(() => {
    if (!isNilOrError(originalCampaignConsents)) {
      const campaignConsentsEntries = originalCampaignConsents.data
        .sort((a, b): number => a.id.localeCompare(b.id))
        .map((consent): [string, CampaignConsent] => [
          consent.id,
          {
            consented: consent.attributes.consented,
            content_type: localize(consent.attributes.content_type_multiloc),
            content_type_ordering: consent.attributes.content_type_ordering,
            channel: consent.attributes.channel,
            campaign_type_description: localize(
              consent.attributes.campaign_type_description_multiloc
            ),
          },
        ]);
      setCampaignConsents(Object.fromEntries(campaignConsentsEntries));
    }
  }, [originalCampaignConsents, localize, isInternalCommentingEnabled]);

  useEffect(() => {
    if (loading && !!showFeedback) {
      setLoading(false);
    }
  }, [showFeedback, loading]);

  if (isNilOrError(originalCampaignConsents)) return null;

  const onChange = (id: string) => () => {
    setCampaignConsents({
      ...campaignConsents,
      [id]: {
        ...campaignConsents[id],
        consented: !campaignConsents[id].consented,
      },
    });
  };

  const toggleGroup =
    (group: ConsentGroupView) =>
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      // A fully-off group turns all on; an all-on or mixed group turns all off.
      const turningAllOn = group.group_consented === false;
      const updatedChildren = group.children.map(
        (consent: CampaignConsentChild): [string, CampaignConsentChild] => [
          consent.id,
          { ...consent, consented: turningAllOn },
        ]
      );

      setCampaignConsents({
        ...campaignConsents,
        ...Object.fromEntries(updatedChildren),
      });
    };

  const onFormSubmit = () => {
    const consentChanges = originalCampaignConsents.data
      .filter(
        (consent: ICampaignConsentData): boolean =>
          consent.attributes.consented !==
          campaignConsents[consent.id].consented
      )
      .map(
        (consent: ICampaignConsentData): IConsentChanges => ({
          campaignConsentId: consent.id,
          consented: campaignConsents[consent.id].consented,
        })
      );

    const consentChangesObject: Record<string, any> = Object.fromEntries(
      Object.values(consentChanges).map((consent: IConsentChanges) => [
        consent.campaignConsentId,
        consent.consented,
      ])
    );

    trackEventByName(trackEventName, {
      consentChanges: JSON.stringify(consentChangesObject),
    });

    setShowFeedback(false);
    setLoading(true);
    updateCampaignConsents(
      { consentChanges, unsubscriptionToken },
      {
        onSuccess: () => {
          setShowFeedback('success');
          runOnSave && runOnSave();
        },
        onError: () => {
          setShowFeedback('error');
        },
      }
    );
  };

  // Consents grouped into the accordions shown for a single channel's card.
  // content_type keys (e.g. "general") can occur in both channels, so each
  // group id is namespaced by channel to stay unique across the two cards.
  const channelGroups = (channel: 'email' | 'sms'): ConsentGroupView[] => {
    const consentsForChannel = Object.fromEntries(
      Object.entries(campaignConsents).filter(
        ([, consent]) => consent.channel === channel
      )
    );

    return Object.entries(groupCampaignsConsent(consentsForChannel))
      .sort(sortGroupedCampaignConsents)
      .map(([contentType, group]) => ({
        ...group,
        id: `${channel}-${contentType}`,
        contentType,
      }));
  };

  const emailGroups = channelGroups('email');
  const smsGroups = channelGroups('sms');

  const showSms = smsGroups.length > 0 && smsEnabled;

  return (
    <FormSection>
      <ChannelConsentSection
        titleMessage={messages.emailNotificationsTitle}
        subtitleMessage={messages.emailNotificationsSubTitle}
        groups={emailGroups}
        onToggleGroup={toggleGroup}
        onToggleConsent={onChange}
      />

      {showSms && (
        <ChannelConsentSection
          titleMessage={messages.smsNotificationsTitle}
          subtitleMessage={messages.smsNotificationsSubTitle}
          groups={smsGroups}
          onToggleGroup={toggleGroup}
          onToggleConsent={onChange}
        />
      )}

      <Feedback
        successMessage={formatMessage(messages.messageSuccess)}
        errorMessage={formatMessage(messages.messageError)}
        showFeedback={showFeedback}
        closeFeedback={() => setShowFeedback(false)}
      />

      <Box mt="20px" display="flex">
        <Button type="submit" processing={loading} onClick={onFormSubmit}>
          {formatMessage(messages.submit)}
        </Button>
      </Box>
    </FormSection>
  );
};

export default CampaignConsentForm;
