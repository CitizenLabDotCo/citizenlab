// Be careful when using this component, you have to use onChangeMultiloc and not onChange
// onChange will override the behaviour of this components and without any error from TS not work as intended

import React from 'react';
import { get } from 'lodash';

// components
import QuillEditor, { Props as VanillaProps } from 'components/QuillEditor';
import Label from 'components/UI/Label';

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
    margin-bottom: 12px;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
`;

const LanguageExtension = styled(Label)`
  font-weight: 500;
  margin-left: 5px;
`;

export type InputProps = {
  id: string;
  valueMultiloc?: Multiloc | null;
  label?: string | JSX.Element | null;
  onChangeMultiloc?: (value: Multiloc, locale: Locale) => void;
  renderPerLocale?: (locale: string) => JSX.Element;
};

type DataProps = {
  tenantLocales: GetTenantLocalesChildProps;
};

interface Props extends InputProps, DataProps { }

export interface MultilocEditorProps extends InputProps, VanillaProps {}

interface State { }

class EditorMultiloc extends React.PureComponent<Props & VanillaProps, State> {
  handleOnChange = (locale: Locale) => (html: string) => {
    if (this.props.onChangeMultiloc) {
      this.props.onChangeMultiloc({
        ...this.props.valueMultiloc,
        [locale]: html
      }, locale);
    }
  }

  render() {
    const { tenantLocales, id, label, valueMultiloc, renderPerLocale, ...otherProps } = this.props;

    if (!isNilOrError(tenantLocales)) {

      return (
        <Container id={id} className={`${this.props['className']} e2e-multiloc-editor`} >
          {tenantLocales.map((currentTenantLocale, index) => {
            const value = get(valueMultiloc, [currentTenantLocale], undefined);

            const idLocale = id && `${id}-${currentTenantLocale}`;

            return (
              <EditorWrapper key={currentTenantLocale} className={`${index === tenantLocales.length - 1 && 'last'}`}>
                {label &&
                  <LabelWrapper>
                    <Label>{label}</Label>
                    {tenantLocales.length > 1 &&
                      <LanguageExtension>{currentTenantLocale.toUpperCase()}</LanguageExtension>
                    }
                  </LabelWrapper>
                }

                {renderPerLocale && renderPerLocale(currentTenantLocale)}

                <QuillEditor
                  id={idLocale}
                  value={value || ''}
                  onChange={this.handleOnChange(currentTenantLocale)}
                  {...otherProps}
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

export default (props: InputProps & VanillaProps) => (
  <GetTenantLocales {...props}>
    {tenantLocales => <EditorMultiloc {...props} tenantLocales={tenantLocales} />}
  </GetTenantLocales>
);
