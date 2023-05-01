import React from 'react';

// form
// import { useForm, FormProvider } from 'react-hook-form';

// components
import { Title, Accordion } from '@citizenlab/cl2-component-library';

// i18n
// import { useIntl } from 'utils/cl-intl';
// import messages from './messages';
import { getLocalized } from 'utils/i18n';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

const CampaignConsentForm = () => {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const { data: campaignConsents } = useCampaignConsents();
  if (isNilOrError(campaignConsents)) return null;

  const groupedCampaignConsents = campaignConsents.data.reduce(
    (acc, consent) => {
      const recipient_role = getLocalized(
        consent.attributes.recipient_role_multiloc,
        locale,
        tenantLocales
      );
      const content_type = getLocalized(
        consent.attributes.content_type_multiloc,
        locale,
        tenantLocales
      );
      return {
        ...acc,
        [recipient_role]: {
          ...acc[recipient_role],
          [content_type]: [
            ...((acc[recipient_role] && acc[recipient_role][content_type]) ||
              []),
            consent,
          ],
        },
      };
    },
    {}
  );

  return (
    <>
      {Object.entries(groupedCampaignConsents).map(
        ([role, consentsByRole], i) => (
          <div key={i}>
            <Title variant="h3">{role}</Title>
            {Object.entries(consentsByRole as object).map(
              ([contentType, consentsByContentType], ii) => (
                <Accordion key={ii} title={contentType}>
                  <div>
                    {consentsByContentType.map((consent) => (
                      <T
                        as="p"
                        value={
                          consent.attributes.campaign_type_description_multiloc
                        }
                      />
                    ))}
                  </div>
                </Accordion>
              )
            )}
          </div>
        )
      )}
    </>
  );
};

export default CampaignConsentForm;
