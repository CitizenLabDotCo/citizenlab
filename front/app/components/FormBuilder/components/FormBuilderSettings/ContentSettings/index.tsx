import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { SectionField } from 'components/admin/Section';
import { getAdditionalSettings } from 'components/FormBuilder/utils';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Toggle from 'components/HookForm/Toggle';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../../messages';
import FieldTypeSwitcher from '../FieldTypeSwitcher';

type ContentSettingsProps = {
  field: IFlatCustomFieldWithIndex;
};

const ContentSettings = ({ field }: ContentSettingsProps) => {
  const { projectId } = useParams();

  const locales = useAppConfigurationLocales();
  const { watch } = useFormContext();
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const lockedAttributes = field.constraints?.locks?.attributes || [];
  const platformLocale = useLocale();
  const isFieldGrouping = field.input_type === 'page';

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  if (!locales) {
    return null;
  }

  return (
    <Box mt="16px">
      {!isFieldGrouping && (
        <>
          <FieldTypeSwitcher field={field} />
          {!lockedAttributes.includes('title_multiloc') && (
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                initiallySelectedLocale={platformLocale}
                id="e2e-title-multiloc"
                name={`customFields.${field.index}.title_multiloc`}
                label={<FormattedMessage {...messages.questionTitle} />}
                onKeyDown={handleKeyDown}
              />
            </SectionField>
          )}
          {field.input_type === 'topic_ids' && (
            <Text>
              <FormattedMessage
                {...messages.manageTagsExplanation}
                values={{
                  inputTagsLink: (
                    <Link
                      to={`/admin/projects/${
                        projectId ?? ''
                      }/general/input-tags`}
                      target="_blank"
                    >
                      <FormattedMessage {...messages.inputTagsPage} />
                    </Link>
                  ),
                }}
              />
            </Text>
          )}
          <SectionField>
            <QuillMultilocWithLocaleSwitcher
              name={`customFields.${field.index}.description_multiloc`}
              label={
                <FormattedMessage {...messages.questionDescriptionOptional} />
              }
              noAlign={true}
              maxHeight="150px"
            />
          </SectionField>
        </>
      )}
      {getAdditionalSettings(
        field,
        watch(`customFields.${field.index}.input_type`),
        locales,
        platformLocale
      )}
      {!isFieldGrouping && (
        <SectionField id="e2e-required-toggle">
          <Toggle
            name={`customFields.${field.index}.required`}
            disabled={lockedAttributes.includes('required')}
            label={
              <Text as="span" variant="bodyM" my="0px">
                <FormattedMessage {...messages.requiredToggleLabel} />
              </Text>
            }
          />
        </SectionField>
      )}
    </Box>
  );
};

export default ContentSettings;
