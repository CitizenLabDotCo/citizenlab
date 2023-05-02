import React, { useState, useEffect } from 'react';

// form
// import { useForm, FormProvider } from 'react-hook-form';

// components
import { Accordion } from '@citizenlab/cl2-component-library';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';

// i18n
// import messages from './messages';
import { getLocalized } from 'utils/i18n';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

// typings
import { IConsentData, ICampaignConsents } from 'api/campaign_consents/types';

const groupConsentCampaigns = (campaignConsents: ICampaignConsents, t) => {
  return campaignConsents.data.reduce((group, consent) => {
    const content_type = t(consent.attributes.content_type_multiloc);
    group[content_type] = group[content_type] ?? [];
    group[content_type].push(consent);

    return group;
  }, {});
};

const isGroupConsentedEntries = ([contentType, consentsByContentType]: [
  string,
  IConsentData[]
]) => [
  contentType,
  consentsByContentType.every((consent) => consent.attributes.consented),
];

const CampaignConsentForm = () => {
  const { data: campaignConsents } = useCampaignConsents();
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const t = (multiloc) => getLocalized(multiloc, locale, tenantLocales);
  const [consents, setConsents] = useState({});
  const [consentsGroups, setConsentsGroups] = useState({});
  const [groupedCampaignConsents, setGroupedCampaignConsents] = useState({});

  useEffect(() => {
    if (!isNilOrError(campaignConsents)) {
      setGroupedCampaignConsents(groupConsentCampaigns(campaignConsents, t));
      setConsents(
        Object.fromEntries(
          campaignConsents.data.map((consent) => [
            consent.id,
            consent.attributes.consented,
          ])
        )
      );
      setConsentsGroups(
        Object.fromEntries(
          Object.entries(groupedCampaignConsents).map(isGroupConsentedEntries)
        )
      );
    }
  }, [campaignConsents]);

  if (isNilOrError(campaignConsents)) return null;

  return (
    <>
      {Object.entries(groupedCampaignConsents).map(
        ([contentType, consentsByContentType]: [string, IConsentData[]], i) => (
          <Accordion
            key={i}
            title={
              <CheckboxWithPartialCheck
                id={contentType}
                checked={consentsGroups[contentType]}
                onChange={(x) => console.log(x)}
                label={`${contentType} (${consentsByContentType.length})`}
              />
            }
          >
            <div>
              {consentsByContentType.map((consent) => (
                <CheckboxWithPartialCheck
                  key={consent.id}
                  id={consent.id}
                  checked={consents[consent.id]}
                  onChange={(x) => console.log(x)}
                  label={
                    <T
                      as="p"
                      value={
                        consent.attributes.campaign_type_description_multiloc
                      }
                    />
                  }
                />
              ))}
            </div>
          </Accordion>
        )
      )}
    </>
  );
};

export default CampaignConsentForm;
