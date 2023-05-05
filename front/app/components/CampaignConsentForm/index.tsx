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
// import { SectionField } from 'components/admin/Section';
import Feedback from './feedback';

// i18n
import messages from './messages';
import { getLocalized } from 'utils/i18n';
import { useIntl } from 'utils/cl-intl';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import useUpdateCampaignConsents from 'api/campaign_consents/useUpdateCampaignConsents';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

// typings
import { Multiloc } from 'typings';

interface Consent {
  id: string;
  campaign_type_description_multiloc: Multiloc;
  content_type_multiloc: Multiloc;
  consented: boolean;
}

const groupConsentCampaigns = (campaignConsents, t) => {
  return Object.entries(campaignConsents).reduce(
    (
      groups,
      [
        id,
        {
          consented,
          content_type_multiloc,
          campaign_type_description_multiloc,
        },
      ]: [string, Consent]
    ) => {
      const contentType = t(content_type_multiloc);
      const consent = {
        id,
        consented,
        campaign_type_description_multiloc,
        content_type_multiloc,
      };

      groups[contentType] = groups[contentType] ?? {
        children: [],
        group_consented: consented,
      };
      groups[contentType].group_consented =
        groups[contentType].group_consented === consented ? consented : 'mixed';
      groups[contentType].children.push(consent);

      return groups;
    },
    {}
  );
};

const CampaignConsentForm = () => {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const t = (multiloc) => getLocalized(multiloc, locale, tenantLocales);
  const { formatMessage } = useIntl();
  const { data: originalCampaignConsents } = useCampaignConsents();
  const { mutateAsync: updateCampaignConsents } = useUpdateCampaignConsents();
  const [campaignConsents, setCampaignConsents] = useState({});
  const [groupedCampaignConsents, setGroupedCampaignConsents] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNilOrError(originalCampaignConsents)) {
      setCampaignConsents(
        Object.fromEntries(
          originalCampaignConsents.data.map((consent) => [
            consent.id,
            consent.attributes,
          ])
        )
      );
    }
  }, [originalCampaignConsents]);

  useEffect(() => {
    setGroupedCampaignConsents(groupConsentCampaigns(campaignConsents, t));
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
    const newGroupValue =
      groupedCampaignConsents[contentType].group_consented == false
        ? true
        : false;
    const newConsentsValues = Object.fromEntries(
      groupedCampaignConsents[contentType].children.map((consent) => [
        consent.id,
        { ...consent, consented: newGroupValue },
      ])
    );

    setCampaignConsents({ ...campaignConsents, ...newConsentsValues });
  };

  const onFormSubmit = async () => {
    const updates = originalCampaignConsents.data.reduce(
      (acc: any[], originalConsent) => {
        if (
          originalConsent.attributes.consented !==
          campaignConsents[originalConsent.id].consented
        ) {
          acc.push({
            campaignConsentId: originalConsent.id,
            consented: campaignConsents[originalConsent.id].consented,
          });
        }
        return acc;
      },
      []
    );

    try {
      setShowSuccess(false);
      setShowError(false);
      setLoading(true);
      await updateCampaignConsents(updates);
      setShowSuccess(true);
      setShowError(false);
      setLoading(false);
    } catch (error) {
      setShowSuccess(false);
      setShowError(true);
      setLoading(false);
    }
  };

  const closeFeedback = () => {
    setShowSuccess(false);
    setShowError(false);
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
        showSuccess={showSuccess}
        showError={showError}
        closeFeedback={closeFeedback}
      />
      {Object.entries(groupedCampaignConsents).map(
        (
          [contentType, { children, group_consented }]: [
            string,
            { children: Consent[]; group_consented: boolean | 'mixed' }
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
                label={
                  <Box m="14px 0">{`${contentType} (${children.length})`}</Box>
                }
              />
            }
          >
            <Box ml="34px">
              {children.map(
                ({ id, consented, campaign_type_description_multiloc }) => (
                  <Checkbox
                    key={id}
                    size="20px"
                    mb="12px"
                    checked={consented}
                    onChange={onChange(id)}
                    label={
                      <T as="span" value={campaign_type_description_multiloc} />
                    }
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
