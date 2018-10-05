// Be careful when using this component, you have to use onChangeMultiloc and not onChange
// onChange will override the behaviour of this components and without any error from TS not work as intended

import React from 'react';
import { get } from 'lodash-es';

// components
import QuillEditor, { Props as VanillaProps } from 'components/UI/QuillEditor';
import Label from 'components/UI/Label';
import { Popup } from 'semantic-ui-react';
import Icon from 'components/UI/Icon';

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
  align-items: flex-start;
`;

const InfoIcon = styled(Icon)`
  cursor: pointer;
  width: 20px;
  margin-left: 10px;
`;

const LanguageExtension = styled(Label)`
  font-weight: 500;
  margin-left: 5px;
`;

export type InputProps = {
  id: string;
  valueMultiloc?: Multiloc | null;
  label?: string | JSX.Element | null;
  infoMessage?: string;
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
    const { tenantLocales, id, label, valueMultiloc, renderPerLocale, infoMessage, ...otherProps } = this.props;

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
                    {infoMessage && <Popup
                      basic
                      trigger={
                        <div>
                          <InfoIcon name="info" />
                        </div>
                      }
                      content={infoMessage}
                      position="bottom left"
                    />}
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
