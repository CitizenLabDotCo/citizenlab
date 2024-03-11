import React, { useState } from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { Multiloc, MultilocFormValues } from 'typings';

import useInitiativeOfficialFeedback from 'api/initiative_official_feedback/useInitiativeOfficialFeedback';
import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';
import useUpdateInitiativeStatus from 'api/initiative_statuses/useUpdateInitiativeStatus';
import useInitiativeById from 'api/initiatives/useInitiativeById';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import T from 'components/T';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { isEmptyMultiloc, isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

import StatusChangeForm from './StatusChangeForm';

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

export type Mode = 'latest' | 'new';
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
  const [mode, setMode] = useState<Mode>('new');
  const [newOfficialFeedback, setNewOfficialFeedback] = useState<FormValues>({
    author_multiloc: {},
    body_multiloc: {},
  });

  const { data: initiative } = useInitiativeById(initiativeId);

  const onChangeMode = (mode: Mode) => {
    setMode(mode);
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
