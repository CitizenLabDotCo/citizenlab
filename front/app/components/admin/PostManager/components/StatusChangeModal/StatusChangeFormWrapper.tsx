import React, { useState } from 'react';
import { adopt } from 'react-adopt';
import { get, isEmpty } from 'lodash-es';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import StatusChangeForm from './StatusChangeForm';

// resources
import { isNilOrError } from 'utils/helperUtils';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetInitiativeStatus, {
  GetInitiativeStatusChildProps,
} from 'resources/GetInitiativeStatus';
import GetOfficialFeedbacks, {
  GetOfficialFeedbacksChildProps,
} from 'resources/GetOfficialFeedbacks';

// services
import {
  updateInitiativeStatusWithExistingFeedback,
  updateInitiativeStatusAddFeedback,
} from 'services/initiativeStatusChanges';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';
import T from 'components/T';

// Typings
import { Multiloc, MultilocFormValues } from 'typings';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';

const Container = styled.div`
  background: ${colors.background};
  padding: 25px;
`;
const ContextLine = styled.div`
  margin-bottom: 25px;
  font-size: ${fontSizes.base}px;
`;
const ColoredText = styled.span<{ color: string }>`
  color: ${({ color }) => color};
`;

interface InputProps {
  initiativeId: string;
  newStatusId: string;
  closeModal: () => void;
}

interface DataProps {
  tenantLocales: GetAppConfigurationLocalesChildProps;
  newStatus: GetInitiativeStatusChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
}

interface Props extends DataProps, InputProps {}

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

const StatusChangeFormWrapper = ({
  tenantLocales,
  initiativeId,
  newStatusId,
  closeModal,
  officialFeedbacks,
  newStatus,
}: Props & WrappedComponentProps) => {
  const [mode, setMode] = useState<'latest' | 'new'>('new');
  const [newOfficialFeedback, setNewOfficialFeedback] = useState<FormValues>({
    author_multiloc: {},
    body_multiloc: {},
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const { data: initiative } = useInitiativeById(initiativeId);

  const onChangeMode = (event) => {
    setMode(event);
  };

  const onChangeBody = (value: Multiloc) => {
    setNewOfficialFeedback({
      ...newOfficialFeedback,
      body_multiloc: value,
    });
  };

  const onChangeAuthor = (value: Multiloc) => {
    setNewOfficialFeedback({
      ...newOfficialFeedback,
      author_multiloc: value,
    });
  };

  const validate = () => {
    let validated = true;

    if (!isNilOrError(tenantLocales) && mode === 'new') {
      validated = false;

      tenantLocales.forEach((locale) => {
        if (
          !isEmpty(newOfficialFeedback.author_multiloc[locale]) &&
          !isEmpty(newOfficialFeedback.body_multiloc[locale])
        ) {
          validated = true;
        }
      });

      tenantLocales.forEach((locale) => {
        if (
          (!isEmpty(newOfficialFeedback.author_multiloc[locale]) &&
            isEmpty(newOfficialFeedback.body_multiloc[locale])) ||
          (isEmpty(newOfficialFeedback.author_multiloc[locale]) &&
            !isEmpty(newOfficialFeedback.body_multiloc[locale]))
        ) {
          validated = false;
        }
      });
    }

    return validated;
  };

  const submit = () => {
    const { body_multiloc, author_multiloc } = newOfficialFeedback;
    if (validate()) {
      if (mode === 'new') {
        setLoading(true);
        updateInitiativeStatusAddFeedback(
          initiativeId,
          newStatusId,
          body_multiloc,
          author_multiloc
        )
          .then(() => closeModal())
          .catch(() => {
            setLoading(false);
            setError(true);
          });
      } else if (
        mode === 'latest' &&
        !isNilOrError(officialFeedbacks.officialFeedbacksList)
      ) {
        updateInitiativeStatusWithExistingFeedback(
          initiativeId,
          newStatusId,
          officialFeedbacks.officialFeedbacksList.data[0].id
        )
          .then(() => closeModal())
          .catch(() => {
            setLoading(false);
            setError(true);
          });
      }
    }
  };

  if (
    isNilOrError(initiative) ||
    isNilOrError(newStatus) ||
    officialFeedbacks.officialFeedbacksList === undefined
  ) {
    return null;
  }

  return (
    <Container>
      <ContextLine>
        <FormattedMessage
          {...messages.statusChange}
          values={{
            initiativeTitle: (
              <ColoredText color={colors.teal}>
                <T value={initiative.data.attributes.title_multiloc} />
              </ColoredText>
            ),
            newStatus: (
              <ColoredText color={newStatus.attributes.color}>
                <T value={newStatus.attributes.title_multiloc} />
              </ColoredText>
            ),
          }}
        />
      </ContextLine>
      <StatusChangeForm
        {...{
          loading,
          error,
          newOfficialFeedback,
          mode,
        }}
        valid={validate()}
        onChangeAuthor={onChangeAuthor}
        onChangeBody={onChangeBody}
        onChangeMode={onChangeMode}
        latestOfficialFeedback={get(
          officialFeedbacks,
          'officialFeedbacksList.data[0]',
          null
        )}
        submit={submit}
      />
    </Container>
  );
};

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetAppConfigurationLocales />,
  newStatus: ({ newStatusId, render }) => (
    <GetInitiativeStatus id={newStatusId}>{render}</GetInitiativeStatus>
  ),
  officialFeedbacks: ({ initiativeId, render }) => (
    <GetOfficialFeedbacks postId={initiativeId} postType="initiative">
      {render}
    </GetOfficialFeedbacks>
  ),
});

const StatusChangeFormWrapperWithHocs = injectIntl(StatusChangeFormWrapper);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <StatusChangeFormWrapperWithHocs {...inputProps} {...dataProps} />
    )}
  </Data>
);
