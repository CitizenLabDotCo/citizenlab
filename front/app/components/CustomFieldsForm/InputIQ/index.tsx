import React, { useEffect, useState } from 'react';

import { useFormContext } from 'react-hook-form';

import { IPhaseData } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SimilarIdeasList from 'containers/IdeasNewPage/SimilarInputs/SimilarInputsList';
import { IFlatCustomField } from 'api/custom_fields/types';

const InputIQ = ({
  phase,
  field,
}: {
  phase: IPhaseData | undefined;
  field: IFlatCustomField;
}) => {
  const { watch } = useFormContext();
  const isInputIQEnabled = useFeatureFlag({
    name: 'input_iq',
  });
  const showSimilarInputs = !!(
    phase?.attributes.similarity_enabled && isInputIQEnabled
  );

  let titleMultiloc, bodyMultiloc;
  if (field.code === 'title_multiloc') {
    titleMultiloc = watch('title_multiloc');
  }
  if (field.code === 'body_multiloc') {
    bodyMultiloc = watch('body_multiloc');
  }

  // Debounced values for similar ideas lookup
  const [debouncedTitleMultiloc, setDebouncedTitleMultiloc] =
    useState(titleMultiloc);
  const [debouncedBodyMultiloc, setDebouncedBodyMultiloc] =
    useState(bodyMultiloc);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitleMultiloc(titleMultiloc);
      setDebouncedBodyMultiloc(bodyMultiloc);
    }, 500);

    return () => clearTimeout(timer);
  }, [titleMultiloc, bodyMultiloc]);

  if (!showSimilarInputs) {
    return null;
  }

  return (
    <div>
      <SimilarIdeasList
        titleMultiloc={debouncedTitleMultiloc}
        bodyMultiloc={debouncedBodyMultiloc}
      />
    </div>
  );
};

export default InputIQ;
