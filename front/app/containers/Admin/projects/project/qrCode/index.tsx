import React, {useCallback, useState} from 'react';

// Hooks

// Services

// Components
import {
  Section,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import { Box, Title, Button, Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

// utils
import QRCode from 'react-qr-code';
import usePhase from "api/phases/usePhase";

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

const AdminProjectQRCode = () => {
  const { phaseId } = useParams() as { phaseId: string };

  const [isProcessing, setIsProcessing] = useState(false);
  const { data: phase } = usePhase(phaseId);
  // const { mutate: qrCode } = useQrCode(projectId);

  console.log(isProcessing);
  // If null then don't show one - only show the button to generate

  const handleGenerateQrCode = useCallback(() => {
    setIsProcessing(true);
    // TODO: JS - patch project with qr_code.enabled = true & qr_code.key = null
    // qrCode({ id: projectId }, { onSuccess: () => setIsProcessing(false) });
  }, []);

  const handleDeleteQrCode = useCallback(() => {
    setIsProcessing(true);

    // TODO: JS - patch project with qr_code.enabled = false
    // qrCode(
    //   { id: projectId, remove: true },
    //   { onSuccess: () => setIsProcessing(false) }
    // );
  }, []);

  if (
    !phase ||
    phase.data.attributes.participation_method !== 'voting'
  ) {
    return null;
  }


  // Generate function - POST: /projects/${projectId}/qr-code - returns project object
  const showQrCode = phase?.data.attributes.qr_code;
  // TODO: Add in project
  const qrCodeUrl = `http://localhost:3000/projects/A_PROJECT/qrcode/${phase?.data.attributes.qr_code?.key}`;

  /*
  NEXT TODO: Do a route like the invites route that gets sent out in emails - this will log you in

  /web_api/v1/projects/712e1976-0f49-4ef2-9ce1-fe8a34e44134/qr_code/<qr_code>
  1. send a request to the backend which will return an invited user - based on the project_id and token existing like getUserDataFromToken
  2. This will also log the user in and redirect to a) the main project page & b) later the exact action you want them to take (defined in QR code page) - qrcode_label

  Then create a new tab in invites to generate anonymous user invites.
  Allow these to be shared individually too?
  Maybe allow unique code reg as one of the access rights so you get the option whether to ask for any data at all

  "Sorry the number of users has been exceeded when those invites run out"

  Then add a field for text to show on full screen (qrcode_label)

Instead of this being another registration method - have a checkbox - allow anonymous registration via QR code -
as an addtional way of registering for an action

Additonal 10% - embedded email field on input form - confirm email before idea counts / shows

   */

  /*
  14th June

  QR codes for easy / anonymous voting

  Presents a QR code to admins that they can print or make full screen - React lib generates this
  Scanning this code opens the site and registers you immediately with a unique code - no email or anything else needed
  Admin gets to define how many of these unique codes are available and generate more if needed
  Once users are 'logged_in' with QR code they can add an email - other actions will prompt for this data anyway
  QR codes can be disabled once the session or voting phase is over
  QR codes can be changed in case the code has got out when it shouldn't have done
  If users cannot use a QR code then admins can just give out the unique IDs for users to enter in a modal instead
  */

  /* 14th May */
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
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Title variant="h3" color="primary">
          <FormattedMessage {...messages.title} />
        </Title>
      </Box>

      <SectionDescription>
        <FormattedMessage {...messages.description} />
      </SectionDescription>

      {showQrCode ? (
        <Section>
          <Text>
            Use carefully. Your QR code will open the following URL and log a
            user in for voting only without having to add any personal details.
            This is a unique long URL for this project. Click refresh if you
            want to change this URL and the associated QR code. The QR code will
            register a user against one of the unique codes below. You can
            generate more codes if needed. If you want to Associate these codes
            with a smart group, so you can tell what happened in each session.
            Or associate with an event? Codes should be associated with a
            project.
          </Text>

          <Text>URL: {qrCodeUrl}</Text>
          <QRCode value={qrCodeUrl} />
          <Buttons>
            <Button>Open in new tab - for session friendly purposes</Button>
            <Button
              onClick={handleGenerateQrCode}
              icon="refresh"
              buttonStyle="text"
            >
              Regenerate QR
            </Button>

            <Button
              onClick={handleDeleteQrCode}
              icon="delete"
              buttonStyle="text"
            >
              Delete code
            </Button>
          </Buttons>
        </Section>
      ) : (
        <Section>
          <Button
            onClick={handleGenerateQrCode}
            icon="refresh"
            buttonStyle="text"
          >
            Generate a QR code
          </Button>
        </Section>
      )}

      <SectionTitle>Generate codes</SectionTitle>
      <SectionDescription>
        <p>
          Checkbox: Automatically generate more codes when they run out. If you
          check this, then you may end up with uncontrolled registration if your
          QR code gets in the wrong hands. X invite Codes left
        </p>
      </SectionDescription>
    </Box>
  );
};

export default AdminProjectQRCode;
