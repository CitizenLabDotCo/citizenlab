import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { isEmpty } from 'lodash-es';

// hooks
import useIdeaCustomFields from 'hooks/useIdeaCustomFields';

// services
import { updateIdeaCustomField } from 'services/ideaCustomFields';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Success from 'components/UI/Success';
import IdeaCustomField from './IdeaCustomField';
import { SectionTitle, SectionSubtitle, Section, SectionField } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

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

interface Props {
  className?: string;
}

interface IChanges {
  [key: string]: {
    description_multiloc: Multiloc;
  };
}

const IdeaForm = memo<Props & WithRouterProps & InjectedIntlProps>(({ params, className, intl: { formatMessage } }) => {
  const projectId = params.projectId;

  const [changes, setChanges] = useState<IChanges>({});
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const ideaCustomFields = useIdeaCustomFields({ projectId });

  const allExpanded = Object.getOwnPropertyNames(collapsed).every(key => collapsed[key] === false);

  useEffect(() => {
    if (!isNilOrError(ideaCustomFields) && isEmpty(collapsed)) {
      const newCollapsed = {};
      ideaCustomFields.data.forEach((ideaCustomField) => {
        newCollapsed[ideaCustomField.id] = true;
      });
      setCollapsed(newCollapsed);
    }
  }, [ideaCustomFields, collapsed]);

  const handleIdeaCustomFieldOnCollapseExpand = useCallback((ideaCustomFieldId: string) => {
    setSuccess(false);
    setError(false);
    setCollapsed((collapsed) => ({
      ...collapsed,
      [ideaCustomFieldId]: !collapsed[ideaCustomFieldId]
    }));
  }, []);

  const handleCollapseExpandAll = useCallback(() => {
    const newCollapsed = {};

    if (!allExpanded) {
      Object.keys(collapsed).forEach((key) => newCollapsed[key] = false);
    } else {
      Object.keys(collapsed).forEach((key) => newCollapsed[key] = true);
    }

    setCollapsed(newCollapsed);
  }, [collapsed, allExpanded]);

  const handleIdeaCustomFieldOnChange = useCallback((ideaCustomFieldId: string, { description_multiloc }: { description_multiloc: Multiloc }) => {
    setSuccess(false);
    setError(false);
    setChanges((changes) => ({
      ...changes,
      [ideaCustomFieldId]: {
        description_multiloc
      }
    }));
  }, []);

  const handleOnSubmit = useCallback(async () => {
    if (!isNilOrError(ideaCustomFields)) {
      setProcessing(true);

      try {
        const promises: Promise<any>[] = Object.keys(changes).map((ideaCustomFieldId) => {
          const ideaCustomFieldCode = ideaCustomFields.data.find(item => item.id === ideaCustomFieldId)?.attributes?.code;
          return ideaCustomFieldCode
            ? updateIdeaCustomField(projectId, ideaCustomFieldId, ideaCustomFieldCode, changes[ideaCustomFieldId])
            : Promise.resolve();
        });

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
              <FormattedMessage {...messages.title} />
            </StyledSectionTitle>
            <CollapseExpandAllButton
              buttonStyle="secondary"
              padding="7px 10px"
              onClick={handleCollapseExpandAll}
              text={!allExpanded ? formatMessage(messages.expandAll) : formatMessage(messages.collapseAll)}
            />
          </TitleContainer>
          <SectionSubtitle>
            <FormattedMessage {...messages.subtitle} />
          </SectionSubtitle>
        </Header>

        <Content>
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
        </Content>

        <Footer>
          <Button
            buttonStyle="admin-dark"
            onClick={handleOnSubmit}
            processing={processing}
            disabled={isEmpty(changes)}
          >
            {success
              ? <FormattedMessage {...messages.saved} />
              : <FormattedMessage {...messages.save} />
            }
          </Button>

          {success &&
            <Success
              text={formatMessage(messages.saveSuccessMessage)}
              showBackground={false}
              showIcon={false}
            />
          }

          {error &&
            <Error
              text={formatMessage(messages.errorMessage)}
              showBackground={false}
              showIcon={false}
            />
          }

        </Footer>
      </Container>
    );
  }

  return null;
});

export default withRouter(injectIntl(IdeaForm));
