import React, { memo, useState, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// hooks
import useIdeaCustomFields from 'hooks/useIdeaCustomFields';

// services
import { updateIdeaCustomField } from 'services/ideaCustomFields'

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import IdeaCustomField from './IdeaCustomField';
import { SectionTitle, SectionSubtitle, Section } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const Container = styled.div``;

const CustomFieldsContainer = styled.div``;

const CustomField = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-top: solid 1px ${colors.separation};
  border-bottom: solid 1px ${colors.separation};
`;

const CollapsedContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const ExpandedContent = styled.div`
  border: solid 1px red;
`;

const CustomFieldTitle = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  font-weight: 400;
  line-height: normal;
`;

const EditIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: red;
`;

const CustomFieldEditButton = styled.button`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;

  &:hover {
    ${EditIcon} {
      fill: green;
    }
  }
`;

interface Props {
  className?: string;
}

interface IChanges {
  [key: string]: {
    description_multiloc: Multiloc;
  };
}

const IdeaForm = memo<Props & WithRouterProps>(({ params, className }) => {
  const projectId = params.projectId;

  const [changes, setChanges] = useState<IChanges>({});

  const ideaCustomFields = useIdeaCustomFields({ projectId });

  const handleIdeaCustomFieldOnChange = useCallback((ideaCustomFieldId: string, { description_multiloc }: { description_multiloc: Multiloc }) => {
    setChanges((changes) => ({
      ...changes,
      [ideaCustomFieldId]: {
        description_multiloc
      }
    }));
  }, []);

  const handleOnSubmit = useCallback(() => {
    console.log(changes);
  }, [changes]);

  if (!isNilOrError(ideaCustomFields)) {
    return (
      <Container className={className || ''}>
        <SectionTitle>
          <FormattedMessage {...messages.title} />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage {...messages.subtitle} />
        </SectionSubtitle>
        <Section>
          <CustomFieldsContainer>
            {ideaCustomFields.data.map((ideaCustomField) => {
              return (
                <CustomField key={ideaCustomField.id}>
                  <CollapsedContent>
                    <CustomFieldTitle>
                      {ideaCustomField.attributes.title_multiloc['en']}
                    </CustomFieldTitle>
                    <CustomFieldEditButton>
                      <EditIcon name="edit" />
                    </CustomFieldEditButton>
                  </CollapsedContent>
                  <ExpandedContent>
                    <IdeaCustomField
                      ideaCustomField={ideaCustomField}
                      onChange={handleIdeaCustomFieldOnChange}
                    />
                  </ExpandedContent>
                </CustomField>
              );
            })}
          </CustomFieldsContainer>
        </Section>

        <Button
          buttonStyle="admin-dark"
          onClick={handleOnSubmit}
        >
           <FormattedMessage {...messages.save} />
        </Button>
      </Container>
    );
  }

  return null;
});

export default withRouter(IdeaForm);
