// import React, { memo, useState, useCallback } from 'react';
// import { get } from 'lodash-es';
// import { isNilOrError } from 'utils/helperUtils';

// // components
// import Input from 'components/UI/Input';
// import Label from 'components/UI/Label';
// import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

// // hooks
// import useLocale from 'hooks/useLocale';
// import useTenant from 'hooks/useTenant';

// // style
// import styled from 'styled-components';

// // typings
// import { Locale, Multiloc } from 'typings';

// const Container = styled.div``;

// const LabelWrapper = styled.div`
//   display: flex;
// `;

// const LanguageExtension = styled(Label)`
//   font-weight: 500;
// `;

// interface Props {
//   id?: string | undefined;
//   valueMultiloc: Multiloc | null | undefined;
//   label?: string | JSX.Element | null | undefined;
//   labelTooltip?: JSX.Element;
//   onChange?: (arg: Multiloc, locale: Locale) => void;
//   onBlur?: (arg: React.FormEvent<HTMLInputElement>) => void;
//   type: 'text' | 'email' | 'password' | 'number';
//   placeholder?: string | null | undefined;
//   errorMultiloc?: Multiloc | null;
//   maxCharCount?: number | undefined;
//   disabled?: boolean;
//   shownLocale?: Locale;
//   ariaLabel?: string;
//   setRef?: (arg: HTMLInputElement) => void | undefined;
//   autoFocus?: boolean;
//   className?: string;
// }

// const InputMultilocWithLocaleSwitcher = memo<Props>(({
//   id,
//   valueMultiloc,
//   label,
//   labelTooltip,
//   onChange,
//   onBlur,
//   type,
//   placeholder,
//   errorMultiloc,
//   maxCharCount,
//   disabled,
//   shownLocale,
//   ariaLabel,
//   setRef,
//   autoFocus,
//   className
// }) => {

//   const locale = useLocale();
//   const tenant = useTenant();

//   const [selectedLocale, setSelectedLocale] = useState<Locale | null>(!isNilOrError(locale) ? locale : null);

//   const handleOnChange = useCallback(() => {
//     if (onChange && !isNilOrError(locale)) {
//       onChange({
//         ...valueMultiloc,
//         [locale]: value
//       }, locale);
//     }
//   }, []);

//   const handleOnBlur = useCallback(() => {
//     // empty
//   }, []);

//   const handleOnSelectedLocaleChange = useCallback((locale: Locale) => {
//     setSelectedLocale(locale);
//   }, []);

//   if (!isNilOrError(locale) && !isNilOrError(tenant)) {
//     return (
//       <Container>
//         <FormLocaleSwitcher
//           onLocaleChange={handleOnSelectedLocaleChange}
//           selectedLocale={selectedLocale}
//           values={{}}
//         />

//         {label &&
//           <LabelWrapper>
//             <Label htmlFor={id}>{label}</Label>
//           </LabelWrapper>
//         }

//         <Input
//           setRef={setRef}
//           id={id}
//           value={valueMultiloc || null}
//           type={type}
//           placeholder={placeholder}
//           error={errorMultiloc || null}
//           onChange={handleOnChange}
//           onBlur={handleOnBlur}
//           maxCharCount={maxCharCount}
//           disabled={disabled}
//           ariaLabel={ariaLabel}
//           autoFocus={autoFocus}
//         />
//       </Container>
//     );
//   }

//   return null;
// });

// export default InputMultilocWithLocaleSwitcher;
