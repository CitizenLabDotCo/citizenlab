import React from 'react';
import { useForm } from 'react-hook-form';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Error from 'components/UI/Error';

// typings
import { Multiloc } from 'typings';

interface IFormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export interface Props {
  handleOnSubmit: (formValues: IFormValues) => void;
}

const TopicForm = ({
  intl: { formatMessage },
  handleOnSubmit,
}: Props & InjectedIntlProps) => {
  const { register, handleSubmit, errors } = useForm<IFormValues>();
  const onSubmit = (formValues: IFormValues) => {
    handleOnSubmit(formValues);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputMultilocWithLocaleSwitcher
          id="e2e-topic-name"
          name="title_multiloc"
          label={formatMessage(messages.fieldTopicTitle)}
          labelTooltipText={formatMessage(messages.fieldTopicTitleTooltip)}
          register={register}
        />
        {errors.title_multiloc && (
          <Error
            fieldName="title_multiloc"
            apiErrors={errors.title_multiloc as any}
          />
        )}
        <input type="submit" />
      </form>
    </>
  );
};

export default injectIntl(TopicForm);
