import FeatureFlag from 'components/FeatureFlag';
import TranslateButton from 'components/UI/TranslateButton';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

const StyledTranslateButton = styled(TranslateButton)`
  margin-bottom: 20px;
`;

const IdeasShowTranslateButton = ({
  idea,
  locale,
  translateButtonClicked,
  onClick,
}) => {
  const showTranslateButton =
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !idea.attributes.title_multiloc[locale];

  return (
    <FeatureFlag name="machine_translations">
      {showTranslateButton && (
        <StyledTranslateButton
          translateButtonClicked={translateButtonClicked}
          onClick={onClick}
        />
      )}
    </FeatureFlag>
  );
};

export default IdeasShowTranslateButton;
