import React from 'react';

import { FormLabel, FormSection } from 'components/UI/FormComponents';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeCosponsorsRequired from 'containers/InitiativesShow/hooks/useInitiativeCosponsorsRequired';
import { Text, IconTooltip } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import profileVisibilityMessages from 'containers/IdeasNewPage/IdeasNewForm/messages';
import { useParams } from 'react-router-dom';
import Checkbox from 'components/HookForm/Checkbox';

interface Props {
  triggerModal: () => void;
}

const ProfileVisibilityFormSection = ({ triggerModal }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { initiativeId } = useParams();
  const initiativeCosponsorsRequired = useInitiativeCosponsorsRequired();

  if (!appConfiguration) return null;

  // If we're creating a new initiative, id is undefined and this will be 'false'
  const isEditingInitiative = typeof initiativeId === 'string';
  const allowAnonymousParticipation =
    appConfiguration.data.attributes.settings.initiatives
      ?.allow_anonymous_participation;

  const onHandleSideEffects = () => {
    triggerModal();
  };

  return (
    <>
      {allowAnonymousParticipation &&
        // Don't show in edit form
        !isEditingInitiative &&
        // it doesn't make sense for proposals that need cosponsorship to be anonymous
        !initiativeCosponsorsRequired && (
          <FormSection>
            <FormLabel
              htmlFor="anonymous"
              labelValue={
                <>{formatMessage(profileVisibilityMessages.profileVisiblity)}</>
              }
              display="flex"
              alignItems="center"
            >
              <IconTooltip
                content={
                  <Text color="white" fontSize="s" m="0">
                    {formatMessage(
                      profileVisibilityMessages.inputsAssociatedWithProfile
                    )}
                  </Text>
                }
                iconSize="16px"
                placement="top-start"
                display="inline"
                ml="4px"
                transform="translate(0,-1)"
              />
            </FormLabel>
            <Checkbox
              name="anonymous"
              id="e2e-post-anonymously-checkbox"
              label={
                <Text>
                  {formatMessage(profileVisibilityMessages.postAnonymously)}
                </Text>
              }
              handleSideEffects={onHandleSideEffects}
            />
          </FormSection>
        )}
    </>
  );
};

export default ProfileVisibilityFormSection;
