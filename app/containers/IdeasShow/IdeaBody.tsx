import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import linkifyHtml from 'linkifyjs/html';
import GetMachineTranslation from 'resources/GetMachineTranslation';
import { Locale } from 'typings';
import Fragment from 'components/Fragment';
import QuillEditedContent from 'components/UI/QuillEditedContent';

interface Props {
  ideaId: string;
  ideaBody: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  onTranslationLoaded?: () => void;
}

const IdeaBody = memo<Props>((props: Props) => {
  const { ideaId, ideaBody, locale, translateButtonClicked, onTranslationLoaded } = props;

  return (
    <Fragment name={`ideas/${ideaId}/body`}>
      <QuillEditedContent>
        {(translateButtonClicked && locale) ?
          <GetMachineTranslation attributeName="body_multiloc" localeTo={locale} ideaId={ideaId}>
            {translation => {
              if (!isNilOrError(translation)) {
                onTranslationLoaded && onTranslationLoaded();
                return <span dangerouslySetInnerHTML={{ __html: linkifyHtml(translation.attributes.translation) }} />;
              }

              return <span dangerouslySetInnerHTML={{ __html: linkifyHtml(ideaBody) }} />;
            }}
          </GetMachineTranslation>
          :
          <span dangerouslySetInnerHTML={{ __html: linkifyHtml(ideaBody) }} />
        }
      </QuillEditedContent>
    </Fragment>
  );
});

export default IdeaBody;
