import React, { useState, useEffect } from 'react';

// components
import {
  Accordion,
  Box,
  Button,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';
import Feedback from './feedback';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { groupCampaignsConsent, sortGroupedCampaignConsents } from './utils';

// hooks
import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import useUpdateCampaignConsents from 'api/campaign_consents/useUpdateCampaignConsents';
import useFeatureFlag from 'hooks/useFeatureFlag';

// typings
import {
  CampaignConsent,
  CampaignConsentChild,
  GroupedCampaignConsent,
} from './typings';
import {
  ICampaignConsentData,
  IConsentChanges,
} from 'api/campaign_consents/types';

// analytics
import { trackEventByName } from 'utils/analytics';

// routing
import { useSearchParams } from 'react-router-dom';
import { internalCommentTypes } from 'api/notifications/types';

type Props = {
  trackEventName?: string;
  runOnSave?: () => void;
};
const CampaignConsentForm = ({
  trackEventName = 'Default email notification settings changed',
  runOnSave,
}: Props) => {
  const localize = useLocalize();
  const isInternalCommentingEnabled = useFeatureFlag({
    name: 'internal_commenting',
  });
  const { formatMessage } = useIntl();
  const [searchParams, _] = useSearchParams();
  const unsubscriptionToken = searchParams.get('unsubscription_token');

  const { data: originalCampaignConsents } = useCampaignConsents({
    unsubscriptionToken,
    withoutCampaignNames: [
      ...(isInternalCommentingEnabled ? [] : internalCommentTypes),
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

  const onFormSubmit = async () => {
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

    // analytics
    trackEventByName(trackEventName, {
      extra: {
        consentChanges: Object.fromEntries(
          Object.values(consentChanges).map((consent: IConsentChanges) => [
            consent.campaignConsentId,
            consent.consented,
          ])
        ),
      },
    });

    setShowFeedback(false);
    setLoading(true);
    await updateCampaignConsents(
      { consentChanges },
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
              title={
                <CheckboxWithPartialCheck
                  id={contentType}
                  checked={group_consented}
                  onChange={toggleGroup(contentType)}
                  label={<Box m="14px 0">{contentType}</Box>}
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
                    <Checkbox
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
