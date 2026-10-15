import React from 'react';

import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import usePostingPermission from 'components/FormBuilder/hooks/usePostingPermission';
import { isUserPage } from 'components/FormBuilder/utils';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

import ToolboxItem from './ToolboxItem';

// Drops the page that marks where the demographic questions are asked. There
// can only be one, and only when the phase's access settings allow asking
// them in the form.
const DemographicsToolboxItem = () => {
  const { formatMessage } = useIntl();
  const { phaseId } = useParams({ strict: false });
  const { permission } = usePostingPermission(phaseId);
  const { watch } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  if (!permission) return null;

  const { value, locked } =
    permission.attributes.user_fields_in_form_descriptor;
  const notPossibleInForm = locked && !value;
  const alreadyInForm = formCustomFields.some(isUserPage);

  return (
    <ToolboxItem
      icon="user-data"
      label={formatMessage(messages.demographics)}
      dragId="toolbox_demographics"
      dragIndex={-2}
      disabled={notPossibleInForm || alreadyInForm}
      disabledTooltipMessage={
        notPossibleInForm
          ? messages.demographicsNotPossibleInForm
          : messages.demographicsAlreadyInForm
      }
    />
  );
};

export default DemographicsToolboxItem;
