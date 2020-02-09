// import React, { memo, useState, useCallback, useEffect, FormEvent } from 'react';
// import { get } from 'lodash-es';
// import { isNilOrError } from 'utils/helperUtils';

// // components
// import QuillEditor, { QuillEditorProps } from 'components/UI/QuillEditor';
// import Label from 'components/UI/Label';
// import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

// // hooks
// import useTenant from 'hooks/useTenant';

// // style
// import styled from 'styled-components';

// // typings
// import { Locale, Multiloc } from 'typings';

// const Container = styled.div``;

// const Wrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding-bottom: 8px;
// `;

// const StyledLabel = styled(Label)`
//   flex: 1;
//   padding-bottom: 0px;
// `;

// const Spacer = styled.div`
//   flex: 1;
// `;

// const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
//   width: auto;
// `;

// export interface Props extends Omit<QuillEditorProps, 'value' | 'onChange'> {
//   value: Multiloc | null | undefined;
//   onChange: (value: Multiloc, locale: Locale) => void;
//   onSelectedLocaleChange?: (locale: Locale) => void;
// }

// const QuillMutilocWithLocaleSwitcher = memo<Props>((props) => {

//   const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

//   const tenant = useTenant();
//   const tenantLocales = !isNilOrError(tenant) ? tenant.data.attributes.settings.core.locales : null;

//   useEffect(() => {
//     const newSelectedLocale = tenantLocales && tenantLocales.length > 0 ? tenantLocales[0] : null;
//     setSelectedLocale(newSelectedLocale);
//     props.onSelectedLocaleChange && newSelectedLocale && props.onSelectedLocaleChange(newSelectedLocale);
//   }, [tenantLocales]);

//   const handleValueOnChange = useCallback((value: string, locale: Locale) => {
//     if (!isNilOrError(selectedLocale)) {
//       props.onChange({
//         ...value,
//         [locale]: value
//       });
//     }
//   }, [value, selectedLocale]);

//   const handleOnSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
//     setSelectedLocale(newSelectedLocale);
//     onSelectedLocaleChange && onSelectedLocaleChange(newSelectedLocale);
//   }, []);

//   const handleOnBlur = useCallback((event: FormEvent<HTMLInputElement>) => {
//     onBlur && onBlur(event);
//   }, []);

//   return (
//     <Container className={className}>
//       <Wrapper>
//         {label ? <StyledLabel htmlFor={id}>{label}</StyledLabel> : <Spacer />}

//         {selectedLocale &&
//           <StyledFormLocaleSwitcher
//             onLocaleChange={handleOnSelectedLocaleChange}
//             selectedLocale={selectedLocale}
//             values={{
//               input_field: valueMultiloc as Multiloc
//             }}
//           />
//         }
//       </Wrapper>

//       <QuillEditor
//         id={idLocale}
//         value={valueMultiloc?.[locale] || ''}
//         label={label}
//         labelTooltip={labelTooltip}
//         locale={locale}
//         onChange={this.handleOnChange}
//         noToolbar={noToolbar}
//         noImages={noImages}
//         noVideos={noVideos}
//         noAlign={noAlign}
//         limitedTextFormatting={limitedTextFormatting}
//       />
//     </Container>
//   );
// });

// export default QuillMutilocWithLocaleSwitcher;
