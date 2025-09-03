import React, { useState, useEffect } from 'react';

import {
  Accordion,
  Box,
  Button,
  CheckboxWithLabel,
  Text,
} from '@citizenlab/cl2-component-library';

import {
  ICampaignConsentData,
  IConsentChanges,
} from 'api/campaign_consents/types';
import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import useUpdateCampaignConsents from 'api/campaign_consents/useUpdateCampaignConsents';
import { internalCommentNotificationTypes } from 'api/campaigns/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import Feedback from './feedback';
import messages from './messages';
import {
  CampaignConsent,
  CampaignConsentChild,
  GroupedCampaignConsent,
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
  const [groupedCampaignConsents, setGroupedCampaignConsents] = useState<
    Record<string, GroupedCampaignConsent>
  >({});

  const [showFeedback, setShowFeedback] = useState<false | 'success' | 'error'>(
    false
  );
  const [loading, setLoading] = useState<boolean>(false);

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

  useEffect(() => {
    setGroupedCampaignConsents(groupCampaignsConsent(campaignConsents));
  }, [campaignConsents]);

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

  const toggleGroup = (contentType: string) => (e) => {
    e.stopPropagation();
    const group = groupedCampaignConsents[contentType];
    const newGroupValue = group.group_consented === false ? true : false;
    const newConsentValueEntries = group.children.map(
      (consent: CampaignConsentChild): [string, CampaignConsentChild] => [
        consent.id,
        { ...consent, consented: newGroupValue },
      ]
    );

    setCampaignConsents({
      ...campaignConsents,
      ...Object.fromEntries(newConsentValueEntries),
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

  return (
    <FormSection>
      <FormSectionTitle
        message={messages.notificationsTitle}
        subtitleMessage={messages.notificationsSubTitle}
      />
      <Feedback
        successMessage={formatMessage(messages.messageSuccess)}
        errorMessage={formatMessage(messages.messageError)}
        showFeedback={showFeedback}
        closeFeedback={() => setShowFeedback(false)}
      />
      {Object.entries(groupedCampaignConsents)
        .sort(sortGroupedCampaignConsents)
        .map(
          (
            [contentType, { children, group_consented }]: [
              string,
              GroupedCampaignConsent
            ],
            i
          ) => (
            <Accordion
              key={i}
              title={<Text m="12px">{contentType}</Text>}
              prefix={
                <CheckboxWithPartialCheck
                  id={contentType}
                  checked={group_consented}
                  onChange={toggleGroup(contentType)}
                />
              }
            >
              <Box ml="34px">
                <ScreenReaderOnly>
                  <legend>
                    <FormattedMessage {...messages.ally_categoryLabel} />
                  </legend>
                </ScreenReaderOnly>
                {children.map(
                  ({
                    id,
                    consented,
                    campaign_type_description,
                  }: CampaignConsentChild) => (
                    <CheckboxWithLabel
                      key={id}
                      size="20px"
                      mb="12px"
                      checked={consented}
                      onChange={onChange(id)}
                      label={campaign_type_description}
                    />
                  )
                )}
              </Box>
            </Accordion>
          )
        )}
      <Box mt="20px" display="flex">
        <Button type="submit" processing={loading} onClick={onFormSubmit}>
          {formatMessage(messages.submit)}
        </Button>
      </Box>
    </FormSection>
  );
};

export default CampaignConsentForm;
