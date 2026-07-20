// Preview which fields the active sign-in methods hand back, and which of them
// are locked (not editable by the participant). Both authentication (SSO) and
// verification methods can return fields, and several of them can be active at
// the same time — hence one section per active method, collapsed into
// accordions as soon as there is more than one.

import React from 'react';

import { Accordion, Box, Title, Text } from '@citizenlab/cl2-component-library';

import useIdMethods from 'api/id_methods/useIdMethods';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import FieldList from './FieldList';
import messages from './messages';
import { getActiveMethods } from './utils';

interface Props {
  opened: boolean;
  onClose: () => void;
}

const VerificationFieldsModal = ({ opened, onClose }: Props) => {
  const localize = useLocalize();
  const { data: idMethods } = useIdMethods();

  const activeMethods = getActiveMethods(idMethods, localize);
  const singleMethod =
    activeMethods.length === 1 ? activeMethods[0] : undefined;

  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader
      width="480px"
      header={
        <Title ml="20px" variant="h3" color="primary">
          {singleMethod ? (
            <FormattedMessage
              {...messages.fieldsReturnedByMethod}
              values={{ methodName: singleMethod.name }}
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
                values={{ methodName: singleMethod.name }}
              />
            </Text>
            <Box mt="12px">
              <FieldList fields={singleMethod.fields} />
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
                  title={
                    <Text m="0" fontWeight="bold" color="primary">
                      {method.name}
                    </Text>
                  }
                >
                  <FieldList fields={method.fields} />
                </Accordion>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default VerificationFieldsModal;
