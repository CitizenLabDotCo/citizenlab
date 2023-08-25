import React from 'react';

import { FormSection } from 'components/UI/FormComponents';
import { Box } from '@citizenlab/cl2-component-library';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeCosponsorsRequired from 'hooks/useInitiativeCosponsorsRequired';

interface Props {
  postAnonymously: boolean;
  setPostAnonymously: (newValue: boolean) => void;
  publishedAnonymously: boolean;
}

const ProfileVisibilityFormSection = ({
  postAnonymously,
  setPostAnonymously,
  publishedAnonymously,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const initiativeCosponsorsRequired = useInitiativeCosponsorsRequired();

  if (!appConfiguration) return null;

  const allowAnonymousParticipation =
    appConfiguration.data.attributes.settings.initiatives
      ?.allow_anonymous_participation;

  return (
    <>
      {allowAnonymousParticipation &&
        !publishedAnonymously &&
        !initiativeCosponsorsRequired && (
          <FormSection>
            <Box mt="-20px">
              {/* <ProfileVisiblity
                postAnonymously={postAnonymously}
                setPostAnonymously={setPostAnonymously}
              /> */}
            </Box>
          </FormSection>
        )}
    </>
  );
};

export default ProfileVisibilityFormSection;
