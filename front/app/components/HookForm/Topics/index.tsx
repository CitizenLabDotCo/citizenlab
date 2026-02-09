import React, { useMemo } from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import { CLError, IOption, RHFErrors } from 'typings';

import useInputTopics from 'api/input_topics/useInputTopics';

import useLocalize from 'hooks/useLocalize';

import Error, { TFieldName } from 'components/UI/Error';
import MultipleSelect from 'components/UI/MultipleSelect';
import TopicsPicker from 'components/UI/TopicsPicker';

interface Props {
  name: string;
  projectId?: string;
  scrollErrorIntoView?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
  label?: React.ReactNode;
}

const Topics = ({
  name,
  projectId,
  scrollErrorIntoView,
  id,
  className,
  placeholder,
  label,
}: Props) => {
  const {
    setValue,
    formState: { errors: formContextErrors },
    control,
    getValues,
    trigger,
  } = useFormContext();
  const localize = useLocalize();

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;

  const apiError = errors?.error && ([errors] as CLError[]);

  const { data: inputTopics } = useInputTopics(projectId || '');

  const topics = inputTopics?.data ?? [];

  // Use dropdown when there are child topics (depth > 0) or more than 20 topics
  const hasChildTopics = topics.some((topic) => topic.attributes.depth > 0);
  const useDropdown = hasChildTopics || topics.length > 20;

  const options: IOption[] = useMemo(() => {
    if (!inputTopics?.data) return [];
    return inputTopics.data.map((topic) => ({
      value: topic.id,
      label: localize(topic.attributes.full_title_multiloc),
    }));
  }, [inputTopics, localize]);

  const handleChange = (selectedOptions: IOption[]) => {
    const topicIds = selectedOptions.map((option) => option.value);
    setValue(name, topicIds);
    trigger(name);
  };

  const handlePickerChange = (topicIds: string[]) => {
    setValue(name, topicIds);
    trigger(name);
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={() => {
          const selectedTopicIds: string[] = getValues(name) || [];
          if (useDropdown) {
            return (
              <MultipleSelect
                id={id}
                inputId={id ? `${id}-input` : undefined}
                className={className}
                value={selectedTopicIds}
                options={options}
                onChange={handleChange}
                placeholder={placeholder}
                label={label}
              />
            );
          }
          return (
            <TopicsPicker
              id={id}
              className={className}
              selectedTopicIds={selectedTopicIds}
              availableTopics={topics}
              onClick={handlePickerChange}
            />
          );
        }}
      />
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
        />
      )}
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </>
  );
};

export default Topics;
