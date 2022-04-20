// import React from 'react';

// // resources
// import GetProjects, {
//   GetProjectsChildProps,
//   PublicationStatus,
// } from 'resources/GetProjects';

// // components
// import { Box, Select } from '@citizenlab/cl2-component-library';
// import { HiddenLabel } from 'utils/a11y';

// // typings
// import { IOption } from 'typings';

// // i18n
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from '../../messages';

// interface DataProps {
//   projects: any;
// }

// interface InputProps {
//   currentProjectFilter?: string | null;
//   onProjectFilter: ((filter: IOption) => void);
// }

// interface Props extends DataProps, InputProps {}

// const ProjectFilter = ({
//   projects,
//   currentProjectFilter,
//   onProjectFilter,
// }: Props) => {
//   const projectFilterOptions = projects; // TODO

//   return (
//     <Box width="32%">
//       <HiddenLabel>
//         <FormattedMessage {...messages.hiddenLabelProjectFilter} />
//         <Select
//           id="projectFilter"
//           onChange={onProjectFilter}
//           value={currentProjectFilter || ''}
//           options={projectFilterOptions}
//         />
//       </HiddenLabel>
//     </Box>
//   )
// }

// export default (props: InputProps) => (
//   <GetProjects>
//     {() => (
//       <ProjectFilter {...props} />
//     )}
//   </GetProjects>
// );
