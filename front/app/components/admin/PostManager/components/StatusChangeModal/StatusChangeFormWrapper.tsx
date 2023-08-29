import React, { useState } from 'react';
import { isEmpty } from 'lodash-es';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import StatusChangeForm from './StatusChangeForm';

// resources
import { isEmptyMultiloc, isNilOrError } from 'utils/helperUtils';

// services
import useUpdateInitiativeStatus from 'api/initiative_statuses/useUpdateInitiativeStatus';
// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';
import T from 'components/T';

// Typings
import { Multiloc, MultilocFormValues } from 'typings';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useInitiativeOfficialFeedback from 'api/initiative_official_feedback/useInitiativeOfficialFeedback';

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

interface Props {
  initiativeId: string;
  newStatusId: string;
  feedbackRequired?: boolean;
  closeModal: () => void;
}

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

const StatusChangeFormWrapper = ({
  initiativeId,
  newStatusId,
  feedbackRequired,
  closeModal,
}: Props & WrappedComponentProps) => {
  const tenantLocales = useAppConfigurationLocales();
  const { data: officialFeedbacks } = useInitiativeOfficialFeedback({
    initiativeId,
  });

  const officialFeedbacksList =
    officialFeedbacks?.pages.flatMap((page) => page.data) || [];

  const { data: initiativeStatus } = useInitiativeStatus(newStatusId);
  const {
    mutate: updateInitiativeStatus,
    isLoading,
    isError,
  } = useUpdateInitiativeStatus();
  const [mode, setMode] = useState<'latest' | 'new'>('new');
  const [newOfficialFeedback, setNewOfficialFeedback] = useState<FormValues>({
    author_multiloc: {},
    body_multiloc: {},
  });

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

  const isFeedbackEmpty = () => {
    return (
      isEmptyMultiloc(newOfficialFeedback.body_multiloc) &&
      isEmptyMultiloc(newOfficialFeedback.author_multiloc)
    );
  };

  const validate = () => {
    let validated = true;

    if (!isNilOrError(tenantLocales) && mode === 'new') {
      validated = false;

      if (!feedbackRequired && isFeedbackEmpty()) {
        return true;
      }

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

    if (!feedbackRequired || validate()) {
      if (mode === 'new') {
        updateInitiativeStatus(
          {
            initiativeId,
            initiative_status_id: newStatusId,
            ...(isFeedbackEmpty()
              ? null
              : {
                  official_feedback_attributes: {
                    body_multiloc,
                    author_multiloc,
                  },
                }),
          },
          {
            onSuccess: closeModal,
          }
        );
      } else if (mode === 'latest' && !isNilOrError(officialFeedbacksList)) {
        updateInitiativeStatus(
          {
            initiativeId,
            initiative_status_id: newStatusId,
            official_feedback_id: officialFeedbacksList[0].id,
          },
          {
            onSuccess: closeModal,
          }
        );
      }
    }
  };

  if (isNilOrError(initiative) || !initiativeStatus || !officialFeedbacks) {
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
              <ColoredText color={initiativeStatus.data.attributes.color}>
                <T value={initiativeStatus.data.attributes.title_multiloc} />
              </ColoredText>
            ),
          }}
        />
      </ContextLine>
      <StatusChangeForm
        {...{
          loading: isLoading,
          error: isError,
          newOfficialFeedback,
          mode,
        }}
        valid={validate()}
        onChangeAuthor={onChangeAuthor}
        onChangeBody={onChangeBody}
        onChangeMode={onChangeMode}
        latestOfficialFeedback={officialFeedbacksList[0]}
        submit={submit}
      />
    </Container>
  );
};

export default injectIntl(StatusChangeFormWrapper);
