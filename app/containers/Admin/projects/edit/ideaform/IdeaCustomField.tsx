import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useIdeaCustomFields from 'hooks/useIdeaCustomFields';

// services
import { updateIdeaCustomField, IIdeaCustomFieldData } from 'services/ideaCustomFields'

// components
import Icon from 'components/UI/Icon';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { SectionTitle, SectionSubtitle, Section, SectionField } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const Container = styled.div``;

interface Props {
  ideaCustomField: IIdeaCustomFieldData;
  onChange: (ideaCustomFieldId: string, { description_multiloc: Multiloc }) => void;
  className?: string;
}

const IdeaCustomField = memo<Props>(({ ideaCustomField, onChange, className }) => {

  console.log(ideaCustomField);

  const [descriptionMultiloc, setDescriptionMultiloc] = useState(ideaCustomField.attributes.description_multiloc);

  const handleOnChange = useCallback((description_multiloc: Multiloc) => {
    setDescriptionMultiloc(description_multiloc);
    onChange(ideaCustomField.id, { description_multiloc });
  }, [onChange]);

  if (!isNilOrError(ideaCustomField)) {
    return (
      <Container className={className || ''}>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={descriptionMultiloc}
          onValueChange={handleOnChange}
        />
      </Container>
    );
  }

  return null;
});

export default IdeaCustomField;
