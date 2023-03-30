import React from 'react';

// components
import {
  Box,
  Title,
  Text,
  Button,
  colors,
  Badge,
} from '@citizenlab/cl2-component-library';

// services
import {
  isBuiltInField,
  IUserCustomFieldData,
} from 'services/userCustomFields';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../containers/Granular/messages';

type SelectionScreenProps = {
  selectedFields: Array<IUserCustomFieldData>;
  registrationFieldList: Array<IUserCustomFieldData> | null | undefined;
  locale: string;
  setSelectedFields: (fields: Array<IUserCustomFieldData>) => void;
  setShowAddFieldPage: (show: boolean) => void;
};

export const SelectionScreen = ({
  registrationFieldList,
  selectedFields,
  locale,
  setSelectedFields,
  setShowAddFieldPage,
}: SelectionScreenProps) => {
  return (
    <>
      <Box mb="20px">
        <Title variant="h3" color="primary">
          <FormattedMessage {...messages.addQuestion} />
        </Title>
        {registrationFieldList &&
          registrationFieldList
            .filter((field) => !selectedFields.includes(field))
            .map((field) => (
              <Box
                display="flex"
                justifyContent="space-between"
                key={field.id}
                py="4px"
                borderTop="solid"
                borderWidth="1px"
                borderColor={colors.grey300}
              >
                <Box display="flex">
                  <Text color="primary" mr="12px">
                    {field.attributes.title_multiloc[locale]}
                  </Text>
                  {field.attributes.required && (
                    <Badge
                      className="inverse"
                      color={colors.error}
                      style={{
                        height: '24px',
                        marginTop: 'auto',
                        marginBottom: 'auto',
                      }}
                    >
                      <FormattedMessage {...messages.required} />
                    </Badge>
                  )}
                </Box>

                <Box display="flex">
                  {isBuiltInField(field) && (
                    <Text color="primary" fontSize="s" mr="20px" my="auto">
                      <FormattedMessage {...messages.defaultField} />
                    </Text>
                  )}
                  <Button
                    bgColor={colors.primary}
                    onClick={() => {
                      setSelectedFields(selectedFields.concat([field]));
                    }}
                  >
                    <FormattedMessage {...messages.select} />
                  </Button>
                </Box>
              </Box>
            ))}
      </Box>
      <Box display="flex">
        <Button
          icon="plus-circle"
          buttonStyle="secondary"
          onClick={() => {
            setShowAddFieldPage(true);
          }}
        >
          <FormattedMessage {...messages.createANewQuestion} />
        </Button>
      </Box>
    </>
  );
};
