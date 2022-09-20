// // @ts-nocheck
// // for dev purposes
// import React from 'react';
// import { render, screen, act, fireEvent } from 'utils/testUtils/rtl';
// import GenericHeroBannerForm from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm';
// // import LayoutSettingField from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/LayoutSettingField';
// // import BannerImageFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields';
// // import BannerHeaderFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields';
// // import { THomepageBannerLayout } from 'services/homepageSettings';

// jest.mock('services/locale');
// jest.mock('services/appConfiguration');
// jest.mock('utils/analytics');
// jest.mock('utils/cl-router/withRouter');
// jest.mock('utils/cl-router/Link');
// jest.mock('utils/cl-intl');
// jest.mock(
//   'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/LayoutSettingField',
//   () => 'LayoutSettingField'
// );
// jest.mock(
//   'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields',
//   () => 'BannerImageFields'
// );
// jest.mock(
//   'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields',
//   () => 'BannerHeaderFields'
// );

// jest.mock('components/UI/Warning', () => 'Warning');

// jest.mock('../../../GenericHeroBannerForm/messages', () => ({
//   heroBannerTitle: { id: 'id1', defaultMessage: 'Hero banner' },
//   bannerTextTitle: { id: 'id2', defaultMessage: 'Banner text' },
//   bannerHeaderSignedOut: {
//     id: 'id3',
//     defaultMessage: 'Header text for non-registered visitors',
//   },
//   headerImageSupportPageURL: {
//     id: 'id4',
//     defaultMessage:
//       'https://support.citizenlab.co/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
//   },
// }));

// const setFormStatus = jest.fn();
// const onSave = jest.fn();
// // const handleLayoutOnChange = jest.fn();
// // const handleOnBannerImageAdd = jest.fn();
// // const handleOnBannerImageRemove = jest.fn();
// // const handleOverlayColorOnChange = jest.fn();
// // const handleOverlayOpacityOnChange = jest.fn();
// // const handleHeaderSignedOutMultilocOnChange = jest.fn();
// // const handleSubheaderSignedOutMultilocOnChange = jest.fn();

// const mockBreadcrumbs = [
//   {
//     label: 'test',
//   },
// ];

// // const localSettings = {
// //   banner_layout: 'full_width_banner_layout' as THomepageBannerLayout,
// //   banner_overlay_opacity: 70,
// //   banner_overlay_color: '#FFFFFF',
// //   banner_header_multiloc: { en: 'Signed out header' },
// //   banner_subheader_multiloc: { en: 'Signed out subhead' },
// //   header_bg: {
// //     large: 'https://example.com/image.png',
// //     medium: 'https://example.com/image.png',
// //     small: 'https://example.com/image.png',
// //   },
// // };

// describe('CustomPages Edit HeroBanner index', () => {
//   it('renders with proper settings', () => {
//     render(
//       <GenericHeroBannerForm
//         onSave={onSave}
//         formStatus={'enabled'}
//         isLoading={false}
//         breadcrumbs={mockBreadcrumbs}
//         title={'Hero banner'}
//         setFormStatus={setFormStatus}
//         // layoutSettingFieldComponent={
//         //   <LayoutSettingField
//         //     bannerLayout={localSettings.banner_layout}
//         //     onChange={handleLayoutOnChange}
//         //   />
//         // }
//         // bannerImageFieldsComponent={
//         //   <BannerImageFields
//         //     bannerLayout={localSettings.banner_layout}
//         //     bannerOverlayColor={localSettings.banner_overlay_color}
//         //     bannerOverlayOpacity={localSettings.banner_overlay_opacity}
//         //     headerBg={localSettings.header_bg}
//         //     setFormStatus={setFormStatus}
//         //     onAddImage={handleOnBannerImageAdd}
//         //     onRemoveImage={handleOnBannerImageRemove}
//         //     onOverlayColorChange={handleOverlayColorOnChange}
//         //     onOverlayOpacityChange={handleOverlayOpacityOnChange}
//         //   />
//         // }
//         // bannerHeaderFieldsComponent={
//         //   <BannerHeaderFields
//         //     bannerHeaderMultiloc={localSettings.banner_header_multiloc}
//         //     bannerSubheaderMultiloc={localSettings.banner_subheader_multiloc}
//         //     onHeaderChange={handleHeaderSignedOutMultilocOnChange}
//         //     onSubheaderChange={handleSubheaderSignedOutMultilocOnChange}
//         //     titleMessage={'Banner text'}
//         //     inputLabelMessage={'Header text for non-registered visitors'}
//         //   />
//         // }
//       />
//     );
//     expect(
//       screen.getByText('Customise the hero banner image and text.')
//     ).toBeInTheDocument();
//   });

//   it('correctly stores updated properties to state and sends them to the backend', async () => {
//     render(
//       <GenericHeroBannerForm
//         type="customPage"
//         inputSettings={mockInputSettings}
//         setFormStatus={setFormStatus}
//         isLoading={false}
//         breadcrumbs={mockBreadcrumbs}
//         onSave={onSave}
//         formStatus={'enabled'}
//       />
//     );

//     await act(async () => {
//       const signedOutHeaderInput =
//         screen.getByDisplayValue('Signed out header');
//       fireEvent.change(signedOutHeaderInput, {
//         target: { value: 'Signed out header updated' },
//       });
//     });
//     await act(async () => {
//       const signedOutSubheaderInput =
//         screen.getByDisplayValue('Signed out subhead');
//       fireEvent.change(signedOutSubheaderInput, {
//         target: { value: 'Signed out subhead updated' },
//       });
//     });

//     // save form
//     await act(async () => {
//       fireEvent.click(screen.getByText('Save hero banner'));
//     });

//     expect(onSave).toHaveBeenCalledWith({
//       banner_layout: 'full_width_banner_layout',
//       banner_overlay_opacity: 70,
//       banner_overlay_color: '#FFFFFF',
//       banner_header_multiloc: { en: 'Signed out header updated' },
//       banner_subheader_multiloc: { en: 'Signed out subhead updated' },
//       header_bg: {
//         large: 'https://example.com/image.png',
//         medium: 'https://example.com/image.png',
//         small: 'https://example.com/image.png',
//       },
//     });
//   });
// });
