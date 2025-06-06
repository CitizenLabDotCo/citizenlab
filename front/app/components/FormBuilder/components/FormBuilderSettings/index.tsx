import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import {
  ICustomFieldSettingsTab,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import {
  getTranslatedStringKey,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';
import CloseIconButton from 'components/UI/CloseIconButton';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';
import tracks from '../tracks';
import { getFieldNumbers } from '../utils';

import ContentSettings from './ContentSettings';
import LogicSettings from './LogicSettings';
import PrintSupportTooltip from './PrintSupportTooltip';

interface Props {
  field: IFlatCustomFieldWithIndex;
  closeSettings: (triggerAutosave?: boolean) => void;
  builderConfig: FormBuilderConfig;
  formHasSubmissions: boolean;
}

const FormBuilderSettings = ({
  field,
  closeSettings,
  builderConfig,
  formHasSubmissions,
}: Props) => {
  const locales = useAppConfigurationLocales();
  const localize = useLocalize();
  const [currentTab, setCurrentTab] = useState<ICustomFieldSettingsTab>(
    field.defaultTab || 'content'
  );
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  if (isNilOrError(locales)) {
    return null;
  }

  const getPageList = () => {
    const fieldNumbers = getFieldNumbers(formCustomFields);
    const pageArray: { value: string; label: string }[] = [];

    formCustomFields.forEach((field, i) => {
      if (field.input_type === 'page') {
        const isLastPage = i === formCustomFields.length - 1;

        const pageTitle = localize(field.title_multiloc);
        const pageLabel = isLastPage
          ? formatMessage(messages.lastPage)
          : `${formatMessage(messages.page)} ${fieldNumbers[field.id]}${
              pageTitle
                ? `: ${
                    pageTitle.length > 25
                      ? `${pageTitle.slice(0, 25)}...`
                      : pageTitle
                  }`
                : ''
            }`;

        pageArray.push({
          value: field.temp_id || field.id,
          label: pageLabel,
        });
      }
    });
    return pageArray;
  };

  const translatedStringKey = getTranslatedStringKey(
    watch(`customFields.${field.index}.input_type`),
    field.key
  );
  const tabNotActiveBorder = `1px solid ${colors.grey400}`;
  const tabActiveBorder = `4px solid ${colors.primary}`;
  const fieldType = watch(`customFields.${field.index}.input_type`);

  const getShowTabbedSettings = () => {
    const isFieldWithLogicTab = [
      'multiselect',
      'multiselect_image',
      'linear_scale',
      'select',
      'rating',
      'page',
    ].includes(fieldType);

    const isFormEndPage = fieldType === 'page' && field.key === 'form_end';

    return isFieldWithLogicTab && !isFormEndPage;
  };

  const showTabbedSettings = getShowTabbedSettings();

  // Which page is the current question on?
  // Technically there should always be a current page ID and null should never be returned
  const getCurrentPageId = (questionId: string): string | null => {
    if (fieldType === 'page') return field.id;

    let pageId: string | null = null;
    for (const field of formCustomFields) {
      if (field.input_type === 'page') pageId = field.id;
      if (field.id === questionId) return pageId;
    }
    return null;
  };

  return (
    <Box
      right="0"
      top={`${stylingConsts.menuHeight}px`}
      bottom="0"
      zIndex="99999"
      p="20px"
      w="100%"
      background="white"
      boxShadow="-2px 0px 1px 0px rgba(0, 0, 0, 0.06)"
      overflowY="auto"
      overflowX="hidden"
      height={`calc(100vh - ${stylingConsts.menuHeight}px)`}
    >
      <Box
        position="absolute"
        right="10px"
        data-cy="e2e-form-builder-close-settings"
      >
        <CloseIconButton
          a11y_buttonActionMessage={messages.close}
          onClick={() => {
            trackEventByName(tracks.formFieldSettingsCloseButtonClicked);
            closeSettings(true);
          }}
          iconColor={colors.textSecondary}
          iconColorOnHover={'#000'}
        />
      </Box>
      {translatedStringKey && (
        <Box display="flex">
          <Box>
            <Title variant="h4" as="h2" mb="8px">
              <FormattedMessage {...translatedStringKey} />
            </Title>
          </Box>
          <Box pt="16px" ml="8px">
            <PrintSupportTooltip fieldType={fieldType} />
          </Box>
        </Box>
      )}
      {showTabbedSettings && builderConfig.isLogicEnabled && (
        <Box display="flex" width="100%" mb="40px">
          <Box
            flexGrow={1}
            borderBottom={
              currentTab === 'content' ? tabActiveBorder : tabNotActiveBorder
            }
            onClick={() => {
              setCurrentTab('content');
            }}
            style={{ cursor: 'pointer' }}
          >
            <Text mb="12px" textAlign="center" color="coolGrey600">
              <FormattedMessage {...messages.content} />
            </Text>
          </Box>
          <Box
            flexGrow={1}
            borderBottom={
              currentTab === 'logic' ? tabActiveBorder : tabNotActiveBorder
            }
            onClick={() => {
              setCurrentTab('logic');
            }}
            style={{ cursor: 'pointer' }}
            data-cy="e2e-form-builder-logic-tab"
          >
            <Text mb="12px" textAlign="center" color="coolGrey600">
              <FormattedMessage {...messages.logic} />
            </Text>
          </Box>
        </Box>
      )}
      {(!showTabbedSettings ||
        !builderConfig.isLogicEnabled || // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (showTabbedSettings && currentTab === 'content')) && (
        <ContentSettings
          field={field}
          locales={locales}
          formHasSubmissions={formHasSubmissions}
        />
      )}
      {showTabbedSettings && currentTab === 'logic' && (
        <LogicSettings
          pageOptions={getPageList()}
          field={field}
          getCurrentPageId={getCurrentPageId}
          key={field.index}
          builderConfig={builderConfig}
        />
      )}
    </Box>
  );
};

export default FormBuilderSettings;
