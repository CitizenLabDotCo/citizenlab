import styled from 'styled-components';

import ExportMenu from './components/ExportMenu';

export const Sticky = styled.div`
  position: -webkit-sticky;
  position: sticky;
  top: ${(props) => props.theme.menuHeight + 20}px;
`;

export const StyledExportMenu = styled(ExportMenu)`
  margin-left: auto;
`;

export const TopActionBar = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

export const MiddleColumnTop = styled.div`
  transition: 200ms;
  display: flex;
  justify-content: space-between;
  flex: 1;
`;

export const ThreeColumns = styled.div`
  display: flex;
  margin: -10px;
  & > * {
    margin: 10px;
  }
`;

export const LeftColumn = styled.div`
  width: 260px;
  min-width: 260px;
`;

export const MiddleColumn = styled.div`
  flex: 1;
  transition: 200ms;
`;

export type ManagerType =
  | 'AllIdeas' // should come with projectIds a list of projects that the current user can manage.
  | 'ProjectIdeas' // should come with projectId
  | 'ProjectProposals';
export type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';
export type PreviewMode = 'view' | 'edit';
