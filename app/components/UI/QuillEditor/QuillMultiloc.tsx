import React, { PureComponent } from 'react';

// components
import QuillEditor, { Props as QuillEditorProps } from 'components/UI/QuillEditor';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

// resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div``;

const EditorWrapper = styled.div`
  &:not(.last) {
    margin-bottom: 16px;
  }
`;

const LanguageExtension = styled.span`
  font-weight: 500;
  margin-left: 4px;
`;

export interface InputProps extends Omit<QuillEditorProps, 'value' | 'onChange'> {
  valueMultiloc: Multiloc | null | undefined;
  onChange?: (arg: Multiloc) => void;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {}

class QuillMultiloc extends PureComponent<Props, State> {

  handleOnChange = (value: string, locale: Locale | undefined) => {
    if (locale && this.props.onChange) {
      this.props.onChange({
        ...this.props.valueMultiloc,
        [locale]: value
      });
    }
  }

  handleOnBlur = () => {
    this.props.onBlur?.();
  }

  render() {
    const {
      tenantLocales,
      id,
      valueMultiloc,
      labelTooltipText,
      noToolbar,
      noImages,
      noVideos,
      noAlign,
      limitedTextFormatting,
      className
    } = this.props;

    if (!isNilOrError(tenantLocales)) {
      return (
        <Container id={id} className={`${className || ''} e2e-multiloc-editor`} >
          {tenantLocales.map((locale, index) => {
            const idLocale = id && `${id}-${locale}`;
            const label = this.props.label ? (
              <>
                <span>{this.props.label}</span>
                {tenantLocales.length > 1 && <LanguageExtension>{locale.toUpperCase()}</LanguageExtension>}
              </>
            ) : null;

            return (
              <EditorWrapper
                key={locale}
                className={`${index === tenantLocales.length - 1 && 'last'}`}
              >
                <QuillEditor
                  id={idLocale}
                  value={valueMultiloc?.[locale] || ''}
                  label={label}
                  labelTooltipText={labelTooltipText}
                  locale={locale}
                  onChange={this.handleOnChange}
                  noToolbar={noToolbar}
                  noImages={noImages}
                  noVideos={noVideos}
                  noAlign={noAlign}
                  limitedTextFormatting={limitedTextFormatting}
                />
              </EditorWrapper>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

export default (InputProps: InputProps) => (
  <GetTenantLocales>
    {tenantLocales => <QuillMultiloc {...InputProps} tenantLocales={tenantLocales} />}
  </GetTenantLocales>
);
