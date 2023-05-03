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
  const { data: originalCampaignConsents } = useCampaignConsents();
  const [campaignConsents, setCampaignConsents] = useState({});
  const [groupedCampaignConsents, setGroupedCampaignConsents] = useState({});

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

  return (
    <>
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
                label={`${contentType} (${children.length})`}
              />
            }
          >
            <div>
              {children.map(
                ({ id, consented, campaign_type_description_multiloc }) => (
                  <CheckboxWithPartialCheck
                    key={id}
                    id={id}
                    checked={consented}
                    onChange={onChange(id)}
                    label={
                      <T as="p" value={campaign_type_description_multiloc} />
                    }
                  />
                )
              )}
            </div>
          </Accordion>
        )
      )}
    </>
  );
};

export default CampaignConsentForm;
