// import React from 'react';

// // styling
// import styled from 'styled-components';

// const EventInformation = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   margin-left: 20px;
// `;

// const EventMetaAndTitle = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: stretch;
//   margin-bottom: 20px;
// `;

// const EventMeta = styled.div`
//   color: ${colors.label};
//   font-size: ${fontSizes.base}px;
//   font-weight: 400;
//   line-height: normal;
//   display: flex;
//   flex-direction: column;
//   align-items: stretch;
//   margin-bottom: 5px;
// `;

// const EventTitle = styled.h3`
//   color: ${(props: any) => props.theme.colorText};
//   font-size: ${fontSizes.xl}px;
//   font-weight: 500;
//   line-height: normal;
//   padding: 0;
//   margin: 0;
// `;

// const EventDescription = styled.div``;

// const EventLocationWrapper = styled.div`
//   width: 250px;
//   flex: 0 0 250px;
//   padding: 20px;
//   display: flex;
//   align-items: center;
//   border-left: 1px solid #ccc;
//   margin-left: 40px;
// `;

// const EventLocation = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   margin-left: 20px;
//   margin-right: 10px;

//   ${media.smallerThanMaxTablet`
//     margin: 0;
//     margin-bottom: 20px;
//   `}
// `;

// const MapIcon = styled(Icon)`
//   flex: 0 0 24px;
//   width: 24px;
//   height: 24px;
//   fill: ${colors.label};
//   margin-right: 6px;
// `;

// const EventLocationAddress = styled.div`
//   color: ${colors.label};
//   font-size: ${fontSizes.base}px;
//   font-weight: 400;
//   line-height: normal;
//   display: flex;
//   align-items: center;
//   overflow-wrap: break-word;
//   word-wrap: break-word;
//   word-break: break-word;
// `;

// export default () => {
//   return (
//     <EventInformation>
//           <EventMetaAndTitle>
//             <EventMeta>{eventDateTime}</EventMeta>

//             <EventTitle>
//               <T value={event.attributes.title_multiloc} />
//             </EventTitle>
//           </EventMetaAndTitle>

//           {smallerThanLargeTablet && hasLocation && (
//             <EventLocation>
//               <MapIcon name="mapmarker" />
//               <EventLocationAddress>
//                 <T value={event.attributes.location_multiloc} />
//               </EventLocationAddress>
//             </EventLocation>
//           )}

//           <EventDescription>
//             <QuillEditedContent textColor={theme.colorText}>
//               <T
//                 value={event.attributes.description_multiloc}
//                 supportHtml={true}
//               />
//             </QuillEditedContent>
//           </EventDescription>

//           {!isNilOrError(eventFiles) && eventFiles.length > 0 && (
//             <FileAttachments files={eventFiles} />
//           )}
//         </EventInformation>

//         {!smallerThanLargeTablet && hasLocation && (
//           <EventLocationWrapper>
//             <EventLocation>
//               <MapIcon name="mapmarker" />
//               <EventLocationAddress>
//                 <T value={event.attributes.location_multiloc} />
//               </EventLocationAddress>
//             </EventLocation>
//       </EventLocationWrapper>
//     )}
//   )
// }
