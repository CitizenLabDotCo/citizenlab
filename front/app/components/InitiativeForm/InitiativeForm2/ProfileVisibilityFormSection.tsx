import React from 'react';

import { FormSection } from 'components/UI/FormComponents';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeCosponsorsRequired from 'hooks/useInitiativeCosponsorsRequired';
import {
  Text,
  Box,
  IconTooltip,
  Checkbox,
} from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import profileVisibilityMessages from 'components/ProfileVisibility/messages';
import useInitiativeBySlug from 'api/initiatives/useInitiativeBySlug';
import { useParams } from 'react-router-dom';

interface Props {
  postAnonymously: boolean;
  onChange: () => void;
}

const ProfileVisibilityFormSection = ({ postAnonymously, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { slug } = useParams() as { slug: string };
  const { data: initiative } = useInitiativeBySlug(slug);
  const initiativeCosponsorsRequired = useInitiativeCosponsorsRequired();

  if (!appConfiguration) return null;

  // If we're creating a new initiative this will be 'false'
  // because there is no slug and hence no initiative.
  // If we're editing an initiative, it depends on the value set in the form.
  const publishedAnonymously = initiative?.data.attributes.anonymous || false;
  const allowAnonymousParticipation =
    appConfiguration.data.attributes.settings.initiatives
      ?.allow_anonymous_participation;

  return (
    <>
      {allowAnonymousParticipation &&
        // Don't show if the proposal is already published
        !publishedAnonymously &&
        // it doesn't make sense for proposals that need cosponsorship to be anonymous
        !initiativeCosponsorsRequired && (
          <FormSection>
            <Box mt="-20px">
              <Text fontWeight="bold">
                {formatMessage(profileVisibilityMessages.profileVisiblity)}
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
              </Text>
              <Checkbox
                id="e2e-post-anonymously-checkbox"
                checked={postAnonymously}
                label={formatMessage(profileVisibilityMessages.postAnonymously)}
                onChange={onChange}
              />
            </Box>
          </FormSection>
        )}
    </>
  );
};

export default ProfileVisibilityFormSection;
