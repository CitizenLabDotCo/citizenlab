import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isEmpty } from 'lodash-es';

// module specific
import useIdeaCustomFields from './hooks/useIdeaCustomFields';
import {
  updateIdeaCustomField,
  IUpdatedIdeaCustomFieldProperties,
  refetchCustomFields,
} from './services/ideaCustomFields';

import IdeaCustomField from './IdeaCustomField';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Success, Box } from '@citizenlab/cl2-component-library';

import {
  Section,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// styling
import styled from 'styled-components';

// typings
import { Multiloc } from 'typings';

import { IIdeaCustomFieldData } from './services/ideaCustomFields';

const StyledSectionTitle = styled(SectionTitle)`
  padding: 0;
  margin: 0;
`;

const StyledSubSectionTitle = styled(SubSectionTitle)`
  font-weight: 500;
  margin-bottom: 20px;
`;

interface Props {
  className?: string;
}

interface IChanges {
  [key: string]: {
    description_multiloc?: Multiloc;
    enabled?: boolean;
  };
}

const IdeaForm = memo<Props & WithRouterProps & WrappedComponentProps>(
  ({ params, className, intl: { formatMessage } }) => {
    const projectId = params.projectId;

    const [changes, setChanges] = useState<IChanges>({});
    const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const ideaCustomFields = useIdeaCustomFields({ projectId });

    const allExpanded = Object.getOwnPropertyNames(collapsed).every(
      (key) => collapsed[key] === false
    );

    // We are using a custom created id because the ids on the backend change on initial update
    const getCustomFieldId = (ideaCustomField: IIdeaCustomFieldData) =>
      `${ideaCustomField.type}_${ideaCustomField.attributes.key}`;

    useEffect(() => {
      if (!isNilOrError(ideaCustomFields) && isEmpty(collapsed)) {
        const newCollapsed = {};
        ideaCustomFields.data.forEach((ideaCustomField) => {
          newCollapsed[getCustomFieldId(ideaCustomField)] = true;
        });
        setCollapsed(newCollapsed);
      }
    }, [ideaCustomFields, collapsed]);

    const handleIdeaCustomFieldOnCollapseExpand = useCallback(
      (ideaCustomFieldId: string) => {
        setSuccess(false);
        setError(false);
        setCollapsed((collapsed) => ({
          ...collapsed,
          [ideaCustomFieldId]: !collapsed[ideaCustomFieldId],
        }));
      },
      []
    );

    const handleCollapseExpandAll = useCallback(() => {
      const newCollapsed = {};

      if (!allExpanded) {
        Object.keys(collapsed).forEach((key) => (newCollapsed[key] = false));
      } else {
        Object.keys(collapsed).forEach((key) => (newCollapsed[key] = true));
      }

      setCollapsed(newCollapsed);
    }, [collapsed, allExpanded]);

    const handleIdeaCustomFieldOnChange = useCallback(
      (
        ideaCustomFieldId: string,
        updatedProperties: IUpdatedIdeaCustomFieldProperties
      ) => {
        setSuccess(false);
        setError(false);
        setChanges((changes) => {
          const fieldChanges = changes[ideaCustomFieldId]
            ? {
                ...changes[ideaCustomFieldId],
                ...updatedProperties,
              }
            : {
                ...updatedProperties,
              };

          return {
            ...changes,
            [ideaCustomFieldId]: {
              ...fieldChanges,
            },
          };
        });
      },
      []
    );

    const handleOnSubmit = useCallback(async () => {
      if (!isNilOrError(ideaCustomFields)) {
        setProcessing(true);

        try {
          const promises: Promise<any>[] = Object.keys(changes).map(
            (ideaCustomFieldId) => {
              const ideaCustomFieldCode = ideaCustomFields.data.find(
                (item) => item.id === ideaCustomFieldId
              )?.attributes?.code;
              return updateIdeaCustomField(
                projectId,
                ideaCustomFieldId,
                ideaCustomFieldCode,
                changes[ideaCustomFieldId]
              );
            }
          );

          await Promise.all(promises);
          refetchCustomFields(projectId);
          setChanges({});
          setProcessing(false);
          setSuccess(true);
          setError(false);
        } catch (error) {
          setProcessing(false);
          setSuccess(false);
          setError(true);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changes, ideaCustomFields]);

    if (!isNilOrError(ideaCustomFields)) {
      return (
        <Box className={className || ''}>
          <Box width="100%" maxWidth="600px" mb="40px">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb="10px"
            >
              <StyledSectionTitle>
                <FormattedMessage {...messages.inputForm} />
              </StyledSectionTitle>
            </Box>
            <SectionDescription>
              <FormattedMessage {...messages.postDescription} />
            </SectionDescription>
          </Box>

          <Box width="100%" maxWidth="600px" mb="30px">
            <Section>
              <StyledSubSectionTitle>
                <Button
                  buttonStyle="secondary"
                  padding="7px 10px"
                  onClick={handleCollapseExpandAll}
                  text={
                    !allExpanded
                      ? formatMessage(messages.expandAll)
                      : formatMessage(messages.collapseAll)
                  }
                />
              </StyledSubSectionTitle>
              {ideaCustomFields.data.map((ideaCustomField, index) => {
                const id = getCustomFieldId(ideaCustomField);
                return (
                  <IdeaCustomField
                    key={id}
                    collapsed={collapsed[id]}
                    first={index === 0}
                    ideaCustomField={ideaCustomField}
                    onCollapseExpand={handleIdeaCustomFieldOnCollapseExpand}
                    onChange={handleIdeaCustomFieldOnChange}
                    id={id}
                  />
                );
              })}
            </Section>
          </Box>

          <Box display="flex" alignItems="center" minHeight="50px">
            <Button
              buttonStyle="admin-dark"
              onClick={handleOnSubmit}
              processing={processing}
              disabled={isEmpty(changes)}
              id="e2e-ideaform-settings-submit"
            >
              {success ? (
                <FormattedMessage {...messages.saved} />
              ) : (
                <FormattedMessage {...messages.save} />
              )}
            </Button>

            {success && (
              <Success
                text={formatMessage(messages.saveSuccessMessage)}
                showBackground={false}
                showIcon={false}
              />
            )}

            {error && (
              <Box display="flex" flexGrow={1}>
                <Error
                  text={formatMessage(messages.errorMessage)}
                  showBackground={false}
                  showIcon={false}
                />
              </Box>
            )}
          </Box>
        </Box>
      );
    }

    return null;
  }
);

export default withRouter(injectIntl(IdeaForm));
