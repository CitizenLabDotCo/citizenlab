import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { isEmpty } from 'lodash-es';

// hooks
import useIdeaCustomFields from 'hooks/useIdeaCustomFields';

// services
import {
  updateIdeaCustomField,
  IUpdatedIdeaCustomFieldProperties,
} from 'services/ideaCustomFields';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Success } from 'cl2-component-library';
import IdeaCustomField from './IdeaCustomField';
import {
  Section,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';

// typings
import { Multiloc } from 'typings';

const Container = styled.div``;

const Header = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 40px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  padding: 0;
  margin: 0;
`;

const StyledSubSectionTitle = styled(SubSectionTitle)`
  font-weight: 500;
  margin-bottom: 20px;
`;

const CollapseExpandAllButton = styled(Button)``;

const Content = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 30px;
`;

const Footer = styled.div`
  min-height: 50px;
  display: flex;
  align-items: center;
`;

const ErrorWrapper = styled.div`
  flex-grow: 1;
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

const IdeaForm = memo<Props & WithRouterProps & InjectedIntlProps>(
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

    useEffect(() => {
      if (!isNilOrError(ideaCustomFields) && isEmpty(collapsed)) {
        const newCollapsed = {};
        ideaCustomFields.data.forEach((ideaCustomField) => {
          newCollapsed[ideaCustomField.id] = true;
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
              return ideaCustomFieldCode
                ? updateIdeaCustomField(
                    projectId,
                    ideaCustomFieldId,
                    ideaCustomFieldCode,
                    changes[ideaCustomFieldId]
                  )
                : Promise.resolve();
            }
          );

          await Promise.all(promises);
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
    }, [changes, ideaCustomFields]);

    if (!isNilOrError(ideaCustomFields)) {
      return (
        <Container className={className || ''}>
          <Header>
            <TitleContainer>
              <StyledSectionTitle>
                <FormattedMessage {...messages.inputForm} />
              </StyledSectionTitle>
            </TitleContainer>
            <SectionDescription>
              <FormattedMessage {...messages.postDescription} />
            </SectionDescription>
          </Header>

          <Content>
            <Section>
              <StyledSubSectionTitle>
                <CollapseExpandAllButton
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
                return (
                  <IdeaCustomField
                    key={ideaCustomField.id}
                    collapsed={collapsed[ideaCustomField.id]}
                    first={index === 0}
                    ideaCustomField={ideaCustomField}
                    onCollapseExpand={handleIdeaCustomFieldOnCollapseExpand}
                    onChange={handleIdeaCustomFieldOnChange}
                  />
                );
              })}
            </Section>
          </Content>

          <Footer>
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
              <ErrorWrapper>
                <Error
                  text={formatMessage(messages.errorMessage)}
                  showBackground={false}
                  showIcon={false}
                />
              </ErrorWrapper>
            )}
          </Footer>
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(injectIntl(IdeaForm));
