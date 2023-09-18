import React, { useState } from 'react';
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
import messages from './messages';
import MentionsTextArea from 'components/HookForm/MentionsTextArea';
import { IInitiativeCosponsorship } from 'api/initiatives/types';

interface Props {
  cosponsorships?: IInitiativeCosponsorship[];
}

declare module 'components/UI/Error' {
  interface TFieldNameMap {
    cosponsor_ids: 'cosponsor_ids';
  }
}

const CosponsorsFormSection = ({ cosponsorships }: Props) => {
  const initialCosponsorsText = cosponsorships
    ? cosponsorships.reduce(
        (acc, cosponsorship) =>
          `${acc}@[${cosponsorship.name}](${cosponsorship.user_id}) `,
        ''
      )
    : null;
  const [cosponsorsText, setCosponsorsText] = useState<string | null>(
    initialCosponsorsText
  );
  const { data: appConfiguration } = useAppConfiguration();
  const initiativeCosponsorsRequired = useInitiativeCosponsorsRequired();
  const { formatMessage } = useIntl();

  if (!appConfiguration) return null;

  const handleOnChangeInputField = (text: string) => {
    setCosponsorsText(text);
  };

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
              htmlFor="cosponsor_ids"
            >
              <Box mb="12px">
                <Warning>
                  {formatMessage(messages.cosponsorSubtextBeforeInputNote)}
                </Warning>
              </Box>
              <MentionsTextArea
                name="cosponsor_ids"
                rows={1}
                trigger=""
                userReferenceType="id"
                padding="8px 8px 12px"
                placeholder={formatMessage(messages.cosponsorsPlaceholder)}
                onChangeInputField={handleOnChangeInputField}
                displayValue={cosponsorsText}
              />
            </FormLabel>
          </SectionField>
        </FormSection>
      )}
    </>
  );
};

export default CosponsorsFormSection;
