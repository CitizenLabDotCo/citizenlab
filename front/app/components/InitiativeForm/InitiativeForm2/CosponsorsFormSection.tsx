import React from 'react';
import { SectionField } from 'components/admin/Section';
import {
  FormSection,
  FormSectionTitle,
  FormLabel,
} from 'components/UI/FormComponents';
import { Box, Text } from '@citizenlab/cl2-component-library';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeCosponsorsRequired from 'hooks/useInitiativeCosponsorsRequired';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Warning from 'components/UI/Warning';
import messages from '../messages';

const CosponsorsFormSection = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const initiativeCosponsorsRequired = useInitiativeCosponsorsRequired();
  const { formatMessage } = useIntl();

  if (!appConfiguration) return null;

  const cosponsorsNumber =
    appConfiguration.data.attributes.settings.initiatives?.cosponsors_number;

  return (
    <>
      {initiativeCosponsorsRequired && typeof cosponsorsNumber === 'number' && (
        <FormSection>
          <FormSectionTitle message={messages.cosponsorSectionTitle} />
          <SectionField>
            <Text>
              <FormattedMessage
                {...messages.cosponsorSubtextBeforeInput}
                values={{
                  noOfCosponsorsText: (
                    <b>
                      {formatMessage(messages.noOfCosponsorsText, {
                        cosponsorsNumber,
                      })}
                    </b>
                  ),
                }}
              />
            </Text>
            <FormLabel
              labelMessage={messages.cosponsorsLabel}
              htmlFor="cosponsors-input"
            >
              <Box mb="12px">
                <Warning>
                  {formatMessage(messages.cosponsorSubtextBeforeInputNote)}
                </Warning>
              </Box>
              {/* <MentionsTextArea
                id="cosponsors-input"
                name="cosponsors"
                rows={1}
                value={cosponsorsText}
                onChange={setCosponsorsText}
                onChangeMentions={onChangeCosponsors}
                trigger=""
                onBlur={onBlur('cosponsors')}
                userReferenceType="id"
                padding="8px 8px 12px"
                placeholder={formatMessage(messages.cosponsorsPlaceholder)}
              /> */}
            </FormLabel>
          </SectionField>
        </FormSection>
      )}
    </>
  );
};

export default CosponsorsFormSection;
