// Preview which fields the active identification methods hand back, and which
// of them are locked (not editable by the participant). Identification methods
// covers both authentication (SSO) and verification methods — both kinds can
// return fields, and several of them can be active at the same time, hence one
// section per active method, collapsed into accordions as soon as there is more
// than one.

import React from 'react';

import { Accordion, Box, Title, Text } from '@citizenlab/cl2-component-library';

import useIdMethods from 'api/id_methods/useIdMethods';

import useAuthMethodNames, { getMethodName } from 'hooks/useAuthMethodNames';
import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import FieldList from './FieldList';
import messages from './messages';
import { getActiveMethods, getFields } from './utils';

interface Props {
  opened: boolean;
  onClose: () => void;
}

const IdMethodFieldsModal = ({ opened, onClose }: Props) => {
  const localize = useLocalize();
  const authMethodNames = useAuthMethodNames();
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
          {singleMethod ? (
            <FormattedMessage
              {...messages.fieldsReturnedByMethod}
              values={{
                methodName: getMethodName(singleMethod, authMethodNames),
              }}
            />
          ) : (
            <FormattedMessage {...messages.fieldsReturnedByMethods} />
          )}
        </Title>
      }
    >
      <Box p="24px">
        {activeMethods.length === 0 && (
          <Text mt="0" color="coolGrey600">
            <FormattedMessage {...messages.noActiveMethods} />
          </Text>
        )}

        {singleMethod && (
          <>
            <Text mt="0" color="coolGrey600">
              <FormattedMessage
                {...messages.whenAParticipantVerifiesThroughMethod}
                values={{
                  methodName: getMethodName(singleMethod, authMethodNames),
                }}
              />
            </Text>
            <Box mt="12px">
              <FieldList
                fields={getFields(
                  singleMethod.attributes.method_metadata,
                  localize
                )}
              />
            </Box>
          </>
        )}

        {activeMethods.length > 1 && (
          <>
            <Text mt="0" color="coolGrey600">
              <FormattedMessage {...messages.multipleMethodsDescription} />
            </Text>
            <Box mt="12px">
              {activeMethods.map((method) => (
                <Accordion
                  key={method.id}
                  mb="8px"
                  title={
                    <Text
                      m="0"
                      py="12px"
                      fontSize="l"
                      fontWeight="bold"
                      color="primary"
                    >
                      {getMethodName(method, authMethodNames)}
                    </Text>
                  }
                >
                  <FieldList
                    fields={getFields(
                      method.attributes.method_metadata,
                      localize
                    )}
                  />
                </Accordion>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default IdMethodFieldsModal;
