// An overview of the platform's identification methods: what each one can be
// used for (authentication, verification, or both) and which fields it hands
// back, including which of those are locked (not editable by the participant).
//
// The layout is the same either way — a heading naming the method, its
// capabilities, then its fields. With more than one method those blocks collapse
// into accordions so the modal stays scannable; with exactly one there is
// nothing to collapse, so it is shown open.

import React from 'react';

import {
  Accordion,
  Box,
  Title,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import useIdMethods from 'api/id_methods/useIdMethods';

import useIdMethodNames, { getMethodName } from 'hooks/useIdMethodNames';
import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import FieldList from './FieldList';
import messages from './messages';
import MethodBadges from './MethodBadges';
import { getActiveMethods, getFields } from './utils';

interface Props {
  opened: boolean;
  onClose: () => void;
}

// Sits inline right after the words "identification methods", since that is the
// term it defines. The tooltip's own background is dark, so its text has to be
// white — it would be invisible in the default body colour.
const TermsTooltip = () => (
  <IconTooltip
    display="inline-flex"
    ml="2px"
    iconSize="16px"
    // Defaults to 'right-end', which runs the tooltip off the side of the modal
    // and gets it clipped. Downwards it has the full modal width to open into.
    placement="bottom"
    content={
      <Box display="flex" flexDirection="column" gap="8px">
        <Text as="span" m="0" fontSize="s" color="white">
          <FormattedMessage {...messages.identificationExplanation} />
        </Text>
        <Text as="span" m="0" fontSize="s" color="white">
          <FormattedMessage {...messages.authenticationExplanation} />
        </Text>
        <Text as="span" m="0" fontSize="s" color="white">
          <FormattedMessage {...messages.verificationExplanation} />
        </Text>
      </Box>
    }
  />
);

const MethodName = ({ children }: { children: React.ReactNode }) => (
  <Text m="0" py="12px" fontSize="l" fontWeight="bold" color="primary">
    {children}
  </Text>
);

const IdMethodsModal = ({ opened, onClose }: Props) => {
  const localize = useLocalize();
  const idMethodNames = useIdMethodNames();
  const { data: idMethods } = useIdMethods();

  const activeMethods = getActiveMethods(idMethods);
  const singleMethod =
    activeMethods.length === 1 ? activeMethods[0] : undefined;

  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader
      width="620px"
      header={
        // The close button is absolutely positioned over the full-width header,
        // so the title has to keep clear of it on the right.
        <Title ml="20px" mr="56px" variant="h3" color="primary">
          <FormattedMessage {...messages.identificationMethods} />
        </Title>
      }
    >
      <Box p="24px">
        {activeMethods.length === 0 && (
          <Text mt="0" color="coolGrey600">
            <FormattedMessage {...messages.noActiveMethods} />
          </Text>
        )}

        {activeMethods.length > 0 && (
          <>
            <Text m="0" color="coolGrey600">
              <FormattedMessage
                {...messages.introDescription}
                values={{ tooltip: <TermsTooltip /> }}
              />
            </Text>

            <Box mt="12px">
              {singleMethod ? (
                <>
                  <MethodName>
                    {getMethodName(singleMethod, idMethodNames)}
                  </MethodName>
                  <Box mb="12px">
                    <MethodBadges method={singleMethod} />
                  </Box>
                  <FieldList
                    fields={getFields(
                      singleMethod.attributes.method_metadata,
                      localize
                    )}
                  />
                </>
              ) : (
                activeMethods.map((method) => (
                  <Accordion
                    key={method.id}
                    mb="8px"
                    title={
                      <Box
                        display="flex"
                        alignItems="center"
                        gap="10px"
                        flexWrap="wrap"
                      >
                        <MethodName>
                          {getMethodName(method, idMethodNames)}
                        </MethodName>
                        <MethodBadges method={method} />
                      </Box>
                    }
                  >
                    <FieldList
                      fields={getFields(
                        method.attributes.method_metadata,
                        localize
                      )}
                    />
                  </Accordion>
                ))
              )}
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default IdMethodsModal;
