import React, { useState } from 'react';

import Button from 'design-system/Button';
import Divider from 'design-system/Divider';
import IconButton from 'design-system/IconButton';
import Link from 'design-system/Link';
import Menu, { MenuItem, MenuSeparator, MenuTrigger } from 'design-system/Menu';
import RadioGroup, { Radio } from 'design-system/RadioGroup';
import Switch from 'design-system/Switch';
import Text from 'design-system/Text';

import {
  CustomFieldsBehavior,
  IPermissionData,
} from 'api/permissions/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import useAddPermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useAddPermissionsPhaseCustomField';
import useDeletePermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useDeletePermissionsPhaseCustomField';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import rowMessages from 'components/admin/ActionForm/DataSection/DemographicSection/DemographicRow/messages';
import behaviorMessages from 'components/admin/ActionForm/DataSection/DemographicSection/DemographicsBehavior/messages';
import { EXPLANATION_MESSAGES } from 'components/admin/ActionForm/DataSection/DemographicSection/DemographicsPlacement/constants';
import placementMessages from 'components/admin/ActionForm/DataSection/DemographicSection/DemographicsPlacement/messages';
import FieldSelectionModal from 'components/admin/ActionForm/DataSection/DemographicSection/FieldSelectionModal';
import demographicMessages from 'components/admin/ActionForm/DataSection/DemographicSection/messages';
import personalInfoMessages from 'components/admin/ActionForm/DataSection/PersonalInfoSection/messages';
import { Changes } from 'components/admin/ActionForm/types';
import upsellMessages from 'components/UpsellTooltip/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './DemographicsModal.module.css';
import messages from './messages';

const BEHAVIORS: CustomFieldsBehavior[] = ['global', 'disabled', 'custom'];
const BEHAVIOR_LABELS = {
  global: behaviorMessages.global,
  disabled: behaviorMessages.disabled,
  custom: behaviorMessages.custom,
};

interface Props {
  phaseId: string;
  permission: IPermissionData;
  // What the admin changed and has not saved yet, on top of the permission.
  staged: Changes;
  onStage: (changes: Changes) => void;
  // Saves the permission first if it still follows the platform defaults, so
  // a question can be added to it.
  ensureOverridden: () => Promise<IPermissionData>;
}

// The library's Collect demographic data body for one action: personal info,
// which demographic questions to ask and when.
const DemographicsForm = ({
  phaseId,
  permission,
  staged,
  onStage,
  ensureOverridden,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [pickerOpened, setPickerOpened] = useState(false);
  const customAllowed = useFeatureFlag({ name: 'permissions_custom_fields' });

  const { attributes } = permission;
  const { action } = attributes;
  const values = { ...attributes, ...staged };
  const behavior = values.custom_fields_behavior;

  const { data: permissionFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });
  const { data: platformFields } = useUserCustomFields();
  const { mutateAsync: addField, isPending: adding } =
    useAddPermissionsPhaseCustomField({ phaseId, action });
  const { mutate: deleteField } = useDeletePermissionsPhaseCustomField({
    phaseId,
    action,
  });

  const fields = permissionFields?.data ?? [];
  const pickedIds = new Set(
    fields.map(({ relationships }) => relationships.custom_field.data.id)
  );

  const add = async (customFieldId: string) => {
    await ensureOverridden();
    await addField({
      custom_field_id: customFieldId,
      required: false,
      phaseId,
      action,
    });
  };

  const remove = (field: IPermissionsPhaseCustomFieldData) =>
    deleteField({
      id: field.id,
      permission_id: field.relationships.permission.data.id,
      custom_field_id: field.relationships.custom_field.data.id,
    });

  const placement = attributes.user_fields_in_form_descriptor;
  const placementValue = staged.user_fields_in_form ?? placement.value;
  const asksInForm = action === 'posting_idea' && behavior !== 'disabled';

  return (
    <div className={styles.form}>
      {attributes.permitted_by === 'users' && (
        <>
          <section className={styles.section}>
            <Text as="h3" variant="uiStrong" tone="primary">
              {formatMessage(personalInfoMessages.personalInfo)}
            </Text>
            <Switch
              size={28}
              labelAlign="top"
              isSelected={values.require_name}
              onChange={(require_name) => onStage({ require_name })}
            >
              <span className={styles.switchLabel}>
                {formatMessage(personalInfoMessages.fullName)}
                <Text as="span" variant="small" tone="secondary">
                  {formatMessage(personalInfoMessages.fullNameDescription)}
                </Text>
              </span>
            </Switch>
          </section>
          <Divider />
        </>
      )}

      <section className={styles.section}>
        <Text as="h3" variant="uiStrong" tone="primary">
          {formatMessage(demographicMessages.demographicQuestions)}
        </Text>
        <Text variant="ui" tone="secondary" className={styles.groupLabel}>
          {formatMessage(behaviorMessages.whichQuestions)}
        </Text>
        <RadioGroup
          aria-label={formatMessage(behaviorMessages.whichQuestions)}
          value={behavior}
          onChange={(value) => {
            const picked = BEHAVIORS.find((option) => option === value);
            if (picked) onStage({ custom_fields_behavior: picked });
          }}
        >
          {BEHAVIORS.map((option) => (
            <Radio
              key={option}
              value={option}
              disabledReason={
                option === 'custom' && !customAllowed
                  ? formatMessage(upsellMessages.tooltipContent)
                  : undefined
              }
            >
              {formatMessage(BEHAVIOR_LABELS[option])}
              {option === 'global' && (
                <span className={styles.inlineLink}>
                  <Link href="/admin/settings/registration" target="_blank">
                    {formatMessage(messages.seeQuestions)}
                  </Link>
                </span>
              )}
            </Radio>
          ))}
        </RadioGroup>

        {behavior === 'custom' && (
          <div className={styles.questions}>
            <Text variant="small" tone="secondary">
              {formatMessage(demographicMessages.questions)}
            </Text>
            <ul className={styles.questionList}>
              {fields.map((field) => {
                const title = localize(field.attributes.title_multiloc);
                const platformField = platformFields?.data.find(
                  ({ id }) => id === field.relationships.custom_field.data.id
                );
                return (
                  <li key={field.id} className={styles.questionRow}>
                    <span className={styles.questionTitle}>{title}</span>
                    {platformField?.attributes.enabled && (
                      <Text as="span" variant="small" tone="tertiary">
                        {formatMessage(messages.defaultQuestion)}
                      </Text>
                    )}
                    {field.attributes.lock !== 'verification' && (
                      <span className={styles.questionRemove}>
                        <IconButton
                          size={24}
                          icon="x-16"
                          aria-label={formatMessage(
                            rowMessages.removeDemographicField,
                            { fieldName: title }
                          )}
                          onPress={() => remove(field)}
                        />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className={styles.addQuestion}>
              <MenuTrigger>
                <Button
                  variant="secondary"
                  icon="plus-14"
                  isPending={adding}
                >
                  {formatMessage(demographicMessages.addDemographicQuestion)}
                </Button>
                <Menu
                  aria-label={formatMessage(
                    demographicMessages.addDemographicQuestion
                  )}
                  disabledKeys={[...pickedIds]}
                  onAction={(key) => {
                    if (key === 'create') {
                      setPickerOpened(true);
                    } else {
                      add(String(key));
                    }
                  }}
                >
                  {(platformFields?.data ?? []).map((field) => (
                    <MenuItem
                      key={field.id}
                      id={field.id}
                      textValue={localize(field.attributes.title_multiloc)}
                      count={
                        field.attributes.enabled
                          ? formatMessage(messages.defaultQuestion)
                          : undefined
                      }
                    >
                      {localize(field.attributes.title_multiloc)}
                    </MenuItem>
                  ))}
                  <MenuSeparator />
                  <MenuItem id="create" icon="plus-16">
                    {formatMessage(messages.createQuestion)}
                  </MenuItem>
                </Menu>
              </MenuTrigger>
            </div>
          </div>
        )}

        {asksInForm && (
          <>
            <Text variant="ui" tone="secondary" className={styles.groupLabel}>
              {formatMessage(placementMessages.whenToAsk)}
            </Text>
            <RadioGroup
              aria-label={formatMessage(placementMessages.whenToAsk)}
              value={String(placementValue ?? false)}
              onChange={(value) =>
                onStage({ user_fields_in_form: value === 'true' })
              }
            >
              <Radio
                value="false"
                isDisabled={placement.locked}
              >
                {formatMessage(placementMessages.askDemographicQuestionsBefore)}
              </Radio>
              <Radio value="true" isDisabled={placement.locked}>
                {formatMessage(placementMessages.collectDemographicsAfter)}
              </Radio>
            </RadioGroup>
            {placement.explanation && (
              <Text variant="small" tone="secondary">
                {formatMessage(EXPLANATION_MESSAGES[placement.explanation])}
              </Text>
            )}
          </>
        )}
      </section>

      {/* Creating a brand-new question still goes through the field editor. */}
      <FieldSelectionModal
        showSelectionModal={pickerOpened}
        setShowSelectionModal={setPickerOpened}
        selectedFields={fields}
        handleAddField={(field) => {
          add(field.id);
          setPickerOpened(false);
        }}
        isLoading={adding}
      />
    </div>
  );
};

export default DemographicsForm;
