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
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import {
  getTranslatedStringKey,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';
import CloseIconButton from 'components/UI/CloseIconButton';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';

import ContentSettings from './ContentSettings';
import LogicSettings from './LogicSettings';
import PrintSupportTooltip from './PrintSupportTooltip';

interface Props {
  field: IFlatCustomFieldWithIndex;
  closeSettings: (triggerAutosave?: boolean) => void;
  builderConfig: FormBuilderConfig;
}

const FormBuilderSettings = ({
  field,
  closeSettings,
  builderConfig,
}: Props) => {
  const [currentTab, setCurrentTab] = useState<ICustomFieldSettingsTab>(
    field.defaultTab || 'content'
  );
  const { watch } = useFormContext();

  const translatedStringKey = getTranslatedStringKey(
    watch(`customFields.${field.index}.input_type`),
    field.key
  );
  const tabNotActiveBorder = `1px solid ${colors.grey400}`;
  const tabActiveBorder = `4px solid ${colors.primary}`;
  const fieldType = watch(`customFields.${field.index}.input_type`);

  const getShowTabbedSettings = () => {
    const isFieldWithLogicTab = [
      'linear_scale',
      'select',
      'rating',
      'page',
    ].includes(fieldType);

    // For backwards compatibility (pre-2026), we only show the logic tab for multiselect/multiselect_image if they already have logic.
    const fieldHasLogic = field.logic.rules && field.logic.rules.length > 0;
    const isMultiselectWithLogic =
      ['multiselect', 'multiselect_image'].includes(fieldType) &&
      fieldHasLogic &&
      field.created_at < '2026-01-18';

    const isFormEndPage = fieldType === 'page' && field.key === 'form_end';

    return (isFieldWithLogicTab || isMultiselectWithLogic) && !isFormEndPage;
  };

  const showTabbedSettings = getShowTabbedSettings();

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
        <ContentSettings field={field} />
      )}
      {showTabbedSettings && currentTab === 'logic' && (
        <LogicSettings
          field={field}
          key={field.index}
          builderConfig={builderConfig}
        />
      )}
    </Box>
  );
};

export default FormBuilderSettings;
