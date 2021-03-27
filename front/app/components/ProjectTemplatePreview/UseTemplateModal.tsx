import React, { memo, useCallback, useState, useEffect } from 'react';
import { get, isEmpty, transform } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { convertToGraphqlLocale, isNilOrError } from 'utils/helperUtils';
import bowser from 'bowser';
import moment from 'moment';

// utils
import eventEmitter from 'utils/eventEmitter';

// graphql
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from '@apollo/react-hooks';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

// components
import { Input, Icon } from 'cl2-component-library';
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';
import Error from 'components/UI/Error';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { Locale, Multiloc } from 'typings';

const Content = styled.div`
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 35px;
  padding-bottom: 50px;
`;

const StyledInputMultilocWithLocaleSwitcher = styled(
  InputMultilocWithLocaleSwitcher
)`
  margin-bottom: 35px;
`;

const Success = styled.div`
  height: 208px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SuccessIcon = styled(Icon)`
  height: 40px;
  fill: ${colors.clGreenSuccess};
  margin-bottom: 20px;
`;

const SuccessText = styled.div`
  color: ${colors.clGreenSuccess};
  font-size: ${fontSizes.medium}px;
  font-weight: 400;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  > span {
    margin-bottom: 8px;
  }

  a {
    color: ${colors.clGreenSuccess};
    text-decoration: underline;

    &:hover {
      color: ${darken(0.15, colors.clGreenSuccess)};
      text-decoration: underline;
    }
  }
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const CreateProjectButton = styled(Button)`
  margin-right: 10px;
`;

const CloseButton = styled(Button)``;

export interface Props {
  projectTemplateId: string;
  opened: boolean;
  emitSuccessEvent?: boolean;
  showGoBackLink?: boolean;
  close: () => void;
}

interface IVariables {
  projectTemplateId: string | undefined;
  titleMultiloc: Multiloc;
  timelineStartAt: string;
}

const UseTemplateModal = memo<Props & WithRouterProps & InjectedIntlProps>(
  ({
    params,
    intl,
    projectTemplateId,
    opened,
    emitSuccessEvent,
    showGoBackLink,
    close,
  }) => {
    const templateId: string | undefined =
      projectTemplateId || get(params, 'projectTemplateId');

    const tenantLocales = useAppConfigurationLocales();
    const graphqlTenantLocales = useGraphqlTenantLocales();

    const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [startDateError, setStartDateError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [responseError, setResponseError] = useState<any>(null);

    const TEMPLATE_TITLE_QUERY = gql`
    {
      projectTemplate(id: "${projectTemplateId}"){
        titleMultiloc {
          ${graphqlTenantLocales}
        }
      }
    }
  `;

    const APPLY_PROJECT_TEMPLATE = gql`
      mutation ApplyProjectTemplate(
        $projectTemplateId: ID!
        $titleMultiloc: MultilocAttributes!
        $timelineStartAt: String
      ) {
        applyProjectTemplate(
          projectTemplateId: $projectTemplateId
          titleMultiloc: $titleMultiloc
          timelineStartAt: $timelineStartAt
        ) {
          errors
        }
      }
    `;

    const { data } = useQuery(TEMPLATE_TITLE_QUERY);

    const [applyProjectTemplate] = useMutation<any, IVariables>(
      APPLY_PROJECT_TEMPLATE
    );

    const onCreateProject = useCallback(async () => {
      const invalidTitle =
        isEmpty(titleMultiloc) ||
        (titleMultiloc &&
          Object.getOwnPropertyNames(titleMultiloc).every((key) =>
            isEmpty(titleMultiloc[`${key}`])
          ));
      const noDate = isEmpty(startDate);
      const invalidDate = !moment(
        startDate || '',
        'YYYY-MM-DD',
        true
      ).isValid();

      trackEventByName(tracks.useTemplateModalCreateProjectButtonClicked, {
        projectTemplateId,
      });

      if (invalidTitle && !isNilOrError(tenantLocales)) {
        if (tenantLocales.length === 1) {
          setTitleError(intl.formatMessage(messages.projectTitleError));
        } else {
          setTitleError(intl.formatMessage(messages.projectTitleMultilocError));
        }
      }

      if (noDate) {
        setStartDateError(intl.formatMessage(messages.projectNoStartDateError));
      } else if (invalidDate) {
        setStartDateError(
          intl.formatMessage(messages.projectInvalidStartDateError)
        );
      }

      if (!invalidTitle && !invalidDate && titleMultiloc && startDate) {
        setResponseError(null);
        setTitleError(null);
        setStartDateError(null);
        setProcessing(true);

        try {
          await applyProjectTemplate({
            variables: {
              titleMultiloc: transform(
                titleMultiloc,
                (result: Multiloc, val, key: Locale) => {
                  result[convertToGraphqlLocale(key)] = val;
                }
              ),
              projectTemplateId: templateId,
              timelineStartAt: startDate,
            },
          });
          await streams.fetchAllWith({
            apiEndpoint: [`${API_PATH}/projects`],
          });

          if (emitSuccessEvent) {
            eventEmitter.emit('NewProjectCreated');
          }

          setProcessing(false);
          setSuccess(true);
        } catch (error) {
          setProcessing(false);
          setResponseError(error);
        }
      }
    }, [tenantLocales, titleMultiloc, startDate, selectedLocale]);

    const onClose = useCallback(() => {
      close();
    }, []);

    const onTitleChange = useCallback((titleMultiloc: Multiloc | null) => {
      setResponseError(null);
      setTitleError(null);
      setTitleMultiloc(titleMultiloc);
    }, []);

    const onSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
      setSelectedLocale(newSelectedLocale);
    }, []);

    const onStartDateChange = useCallback((startDate: string) => {
      setResponseError(null);
      setStartDateError(null);
      setStartDate(startDate);
    }, []);

    useEffect(() => {
      setTitleMultiloc(null);
      setStartDate(null);
      setSelectedLocale(null);
      setTitleError(null);
      setStartDateError(null);
      setProcessing(false);
      setSuccess(false);
      setResponseError(null);
    }, [opened]);

    const templateTitle = (
      <T value={get(data, 'projectTemplate.titleMultiloc')} />
    );

    return (
      <Modal
        width={500}
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
        header={
          <FormattedMessage
            {...messages.createProjectBasedOn}
            values={{ templateTitle }}
          />
        }
        footer={
          <Footer>
            {!success ? (
              <>
                <CreateProjectButton
                  buttonStyle="secondary"
                  onClick={onCreateProject}
                  processing={processing}
                >
                  <FormattedMessage {...messages.createProject} />
                </CreateProjectButton>
                {responseError !== null && (
                  <Error
                    text={<FormattedMessage {...messages.responseError} />}
                    marginTop="0px"
                    showBackground={false}
                    showIcon={true}
                  />
                )}
              </>
            ) : (
              <CloseButton buttonStyle="secondary" onClick={onClose}>
                <FormattedMessage {...messages.close} />
              </CloseButton>
            )}
          </Footer>
        }
      >
        <Content>
          {!success ? (
            <>
              <StyledInputMultilocWithLocaleSwitcher
                id="project-title"
                label={intl.formatMessage(messages.projectTitle)}
                placeholder={intl.formatMessage(messages.typeProjectName)}
                type="text"
                valueMultiloc={titleMultiloc}
                onChange={onTitleChange}
                onSelectedLocaleChange={onSelectedLocaleChange}
                error={titleError}
                autoFocus={true}
              />

              <Input
                id="project-start-date"
                label={intl.formatMessage(messages.projectStartDate)}
                type="date"
                onChange={onStartDateChange}
                value={startDate}
                error={startDateError}
                placeholder={bowser.msie ? 'YYYY-MM-DD' : undefined}
              />
            </>
          ) : (
            <Success>
              <SuccessIcon name="round-checkmark" />
              <SuccessText>
                <FormattedMessage {...messages.successMessage} />
                {showGoBackLink && (
                  <FormattedMessage
                    {...messages.goBackTo}
                    values={{
                      goBackLink: (
                        <Link to="/admin/projects/">
                          <FormattedMessage
                            {...messages.projectsOverviewPage}
                          />
                        </Link>
                      ),
                    }}
                  />
                )}
              </SuccessText>
            </Success>
          )}
        </Content>
      </Modal>
    );
  }
);

export default withRouter<Props>(injectIntl(UseTemplateModal));
