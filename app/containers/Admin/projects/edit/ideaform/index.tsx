import React, { memo, useState, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { isEmpty } from 'lodash-es';
import CSSTransition from 'react-transition-group/CSSTransition';

// hooks
import useIdeaCustomFields from 'hooks/useIdeaCustomFields';

// services
import { updateIdeaCustomField } from 'services/ideaCustomFields';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Success from 'components/UI/Success';
import IdeaCustomField from './IdeaCustomField';
import { SectionTitle, SectionSubtitle, Section } from 'components/admin/Section';

// i18n
import T from 'components/T';
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const timeout = 400;

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

const CollapseContainer = styled.div`
  opacity: 0;
  display: none;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: opacity, height;

  &.collapse-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.collapse-enter-active {
      opacity: 1;
      max-height: 1000px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-enter-done {
    opacity: 1;
    overflow: visible;
    display: block;
  }

  &.collapse-exit {
    opacity: 1;
    max-height: 1000px;
    overflow: hidden;
    display: block;

    &.collapse-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-exit-done {
    display: none;
  }
`;

const CustomFieldTitle = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  font-weight: 400;
  line-height: normal;
`;

const EditIcon = styled(Icon)`
  width: 15px;
  height: 15px;
  fill: ${colors.label};
  transition: all 80ms ease-out;
`;

const CustomFieldEditButton = styled.button`
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;

  &:hover {
    ${EditIcon} {
      fill: #000;
    }
  }
`;

const ButtonContainer = styled.div`
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
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const ideaCustomFields = useIdeaCustomFields({ projectId });

  const handleIdeaCustomFieldOnChange = useCallback((ideaCustomFieldId: string, { description_multiloc }: { description_multiloc: Multiloc }) => {
    setChanges((changes) => ({
      ...changes,
      [ideaCustomFieldId]: {
        description_multiloc
      }
    }));
  }, []);

  const removeFocus = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleCollapseExpand = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

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
        setChanges({})
        setProcessing(false);
        setSuccess(true);
        setError(false);
        setTimeout(() => setSuccess(false), 5000);
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
                      <T value={ideaCustomField.attributes.title_multiloc} />
                    </CustomFieldTitle>
                    <CustomFieldEditButton onMouseDown={removeFocus} onClick={handleCollapseExpand}>
                      <EditIcon name="edit" />
                    </CustomFieldEditButton>
                  </CollapsedContent>

                  <CSSTransition
                    classNames="collapse"
                    in={!collapsed}
                    timeout={timeout}
                    mounOnEnter={false}
                    unmountOnExit={false}
                    enter={true}
                    exit={true}
                  >
                    <CollapseContainer>
                      <IdeaCustomField
                        ideaCustomField={ideaCustomField}
                        onChange={handleIdeaCustomFieldOnChange}
                      />
                    </CollapseContainer>
                  </CSSTransition>
                </CustomField>
              );
            })}
          </CustomFieldsContainer>
        </Section>

        <ButtonContainer>
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
        </ButtonContainer>

        {success && <Success text={formatMessage(messages.saveSuccessMessage)} showBackground={false} />}

        {error && <Error text={formatMessage(messages.errorMessage)} showBackground={false} />}
      </Container>
    );
  }

  return null;
});

export default withRouter(injectIntl(IdeaForm));
