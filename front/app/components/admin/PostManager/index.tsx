import styled from 'styled-components';

export const Sticky = styled.div`
  position: -webkit-sticky;
  position: sticky;
  top: ${(props) => props.theme.menuHeight + 20}px;
`;
export type ManagerType =
  | 'AllIdeas' // should come with projectIds a list of projects that the current user can manage.
  | 'ProjectIdeas' // should come with projectId
  | 'Initiatives';
export type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';
export type PreviewMode = 'view' | 'edit';
