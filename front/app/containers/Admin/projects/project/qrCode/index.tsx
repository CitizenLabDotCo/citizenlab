import React, { useCallback, useState } from 'react';

// Hooks

// Services

// Components
import {
  Section,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

// utils
import QRCode from 'react-qr-code';
import { Button, Text } from '@citizenlab/cl2-component-library';
import useProject from 'hooks/useProject';
import useQrCode from 'api/projects/useQrCode';

const Container = styled.div``;

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

const ProjectQRCode = () => {
  const { projectId } = useParams() as { projectId: string };

  const [isProcessing, setIsProcessing] = useState(false);
  const project = useProject({ projectId });
  const { mutate: qrCode } = useQrCode(projectId);

  // If null then don't show one - only show the button to generate

  const handleGenerateQrCode = useCallback(() => {
    setIsProcessing(true);
    qrCode(
      { id: projectId },
      // TODO: Refresh the project here - because it won't be done from the
      { onSuccess: () => setIsProcessing(false) }
    );
  }, []);

  // Generate function - POST: /projects/${projectId}/qr-code - returns project object
  const showQrCode = project?.attributes.qr_code !== null;
  const qrCodeUrl = `http://localhost:3000/projects/${projectId}/code/${project?.attributes.qr_code}`;

  console.log(isProcessing, showQrCode);

  // TODO: Select a list of actions?
  // Does flexible reg allow you to upgrade your account with email etc
  // Add checkbox to voting, allow QR code for voting
  // New option qrcode / unique code
  // Add list of unique codes that can be allowed here - fdghtyur

  /* 2 FE URLs
     1. qrcode full version /projects/`projectId`/code/jshdjhsdjsjhsjdhjdhjshd
        - Calls the project/unique_code check endpoint which returns a code or 404
          - Should this 'reserve' the code for 5 mins - by adding a reserve date - so the next request does not return the same one before user is registered
          - Ignore the reserved validation if coming from a QR registration (using a param)
        - Then calls create user with unique_code in the same way as you could via the front-end
          - If unique_code is present then check it against the list of codes in the controller
         - When created redirect to the projects page
     2. version without the ID in it - /projects/`projectId`/code/ - that will display a modal box to enter your code

// If we want to configure where to redirect to then
// Could we change the invite model so that it can have emails or not associated with the codes
// Why does the invite model create a user - surely it should just store the emails in the invite and then create the user when needed
// We could then remove a whole load of guff out of the user model

  */

  /*
  On QR endpoint
  1. Check if code matches what the endpoint returns in qr_code url
  if admin then the code gets returned in response
  if not then there is a true/false endpoint 200 / 404 for the code
  project/code/number - either returns 200 or 404
   */

  // Another idea: Can we auto generate our Types from the API documentation - or at least check they match?
  // To go alongside checking the logs against the documentation to see what is not used

  // On load of this page call the generate endpoint - which will which will return the project back
  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.title} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.description} />
      </SectionDescription>

      <Section>
        <Text>
          Use carefully. Your QR code will open the following URL and log a user
          in for voting only without having to add any personal details. This is
          a unique long URL for this project. Click refresh if you want to
          change this URL and the associated QR code. The QR code will register
          a user against one of the unique codes below. You can generate more
          codes if needed. If you want to Associate these codes with a smart
          group, so you can tell what happened in each session. Or associate
          with an event? Codes should be associated with a project.
        </Text>

        <Text>URL: {qrCodeUrl}</Text>
        <QRCode value={qrCodeUrl} />

        <Buttons>
          <Button>Open in new tab - for session friendly purposes</Button>
          <Button
            onClick={handleGenerateQrCode}
            icon="delete"
            buttonStyle="text"
          >
            Regenerate code
          </Button>

          <Button>Delete code</Button>
        </Buttons>
      </Section>

      <SectionTitle>Generate codes</SectionTitle>
      <SectionDescription>
        <p>
          Checkbox: Automatically generate more codes when they run out. If you
          check this, then you may end up with uncontrolled registration if your
          QR code gets in the wrong hands.
        </p>
      </SectionDescription>
    </Container>
  );
};

export default ProjectQRCode;
