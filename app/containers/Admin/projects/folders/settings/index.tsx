import React, { useState, useRef, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import styled from 'styled-components';
import { SectionTitle, SectionSubtitle, SectionField, Section } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { Multiloc, Locale } from 'typings';
import InputMultiloc from 'components/UI/InputMultiloc';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import Label from 'components/UI/Label';
import TextAreaMultiloc from 'components/UI/TextAreaMultiloc';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const FolderSettings = ({ params }: WithRouterProps) => {
  const locale = useLocale();
  const safeLocale = isNilOrError(locale) ? null : locale;

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(isNilOrError(locale) ? null : locale);

  // if user locale changes, we set the form selectedLocale to it (necessary as locale is initially undefined)
  const prevLocaleRef = useRef<Locale | null>(safeLocale);
  useEffect(() => {
    if (prevLocaleRef.current !== safeLocale) {
      prevLocaleRef.current = safeLocale;
      setSelectedLocale(safeLocale);
    }
  });

  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [shortDescriptionMultiloc, setShortDescriptionMultiloc] = useState<Multiloc | null>(null);
  const [descriptionMultiloc, setDescriptionMultiloc] = useState<Multiloc | null>(null);

  const onSubmit = (values) => console.log(values);

  if (!selectedLocale) return null;

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.titleSettingsTab} />
      </SectionTitle>
      <SectionSubtitle>
        <FormattedMessage {...messages.subtitleSettingsTab} />
      </SectionSubtitle>
      <form>
        <Section>
          <FormLocaleSwitcher selectedLocale={selectedLocale} onLocaleChange={setSelectedLocale} />
          <SectionField>
            <InputMultiloc
              valueMultiloc={titleMultiloc}
              type="text"
              onChange={setTitleMultiloc}
              selectedLocale={selectedLocale}
              label={<FormattedMessage {...messages.titleInputLabel} />}
            />
          </SectionField>
          <SectionField>
            <TextAreaMultiloc
              valueMultiloc={shortDescriptionMultiloc}
              name="textAreaMultiloc"
              onChange={setShortDescriptionMultiloc}
              selectedLocale={selectedLocale}
              label={<FormattedMessage {...messages.shortDescriptionInputLabel} />}
              labelTooltip={<FormattedMessage {...messages.shortDescriptionInputLabelTooltip} />}
            />
          </SectionField>
          <SectionField>
            <QuillMultiloc
              id="description"
              valueMultiloc={descriptionMultiloc}
              onChangeMultiloc={setDescriptionMultiloc}
              selectedLocale={selectedLocale}
              label={<FormattedMessage {...messages.descriptionInputLabel} />}
            />
          </SectionField>
        </Section>
      </form>
    </Container>
  );
};

export default withRouter(FolderSettings);
