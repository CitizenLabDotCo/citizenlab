export const updateConsentByCampaignIDWithToken = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({
      data: {
        attributes: {
          campaign_type_description_multiloc: { en: 'That pesky email' },
        },
      },
    })
  );
