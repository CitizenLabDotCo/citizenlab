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
import { getLocalized } from 'utils/i18n';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { groupConsentCampaigns } from './utils';

// hooks
import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import useUpdateCampaignConsents from 'api/campaign_consents/useUpdateCampaignConsents';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

// typings
import {
  CampaignConsent,
  CampaignConsentChildren,
  GroupedCampaignConsent,
} from './typings';
import {
  ICampaignConsentData,
  IConsentChanges,
} from 'api/campaign_consents/types';

// analytics
import { trackEventByName } from 'utils/analytics';

type Props = {
  trackEventName?: string;
};
const CampaignConsentForm = ({
  trackEventName = 'Default email notification settings changed',
}: Props) => {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const { formatMessage } = useIntl();

  const { data: originalCampaignConsents } = useCampaignConsents();
  const { mutateAsync: updateCampaignConsents } = useUpdateCampaignConsents();

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
            content_type: getLocalized(
              consent.attributes.content_type_multiloc,
              locale,
              tenantLocales
            ),
            campaign_type_description: getLocalized(
              consent.attributes.campaign_type_description_multiloc,
              locale,
              tenantLocales
            ),
          },
        ]);
      setCampaignConsents(Object.fromEntries(campaignConsentsEntries));
    }
  }, [originalCampaignConsents, locale, tenantLocales]);

  useEffect(() => {
    if (loading && !!showFeedback) {
      setLoading(false);
    }
  }, [showFeedback, loading]);

  useEffect(() => {
    setGroupedCampaignConsents(groupConsentCampaigns(campaignConsents));
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
      (consent: CampaignConsentChildren): [string, CampaignConsentChildren] => [
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

    try {
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
      await updateCampaignConsents({ consentChanges });

      setShowFeedback('success');
    } catch (error) {
      setShowFeedback('error');
    }
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
      {Object.entries(groupedCampaignConsents).map(
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
                }: CampaignConsentChildren) => (
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
