import SettingsContainer from '../';
import AreasIndex from './all';
import AreasNew from './New';
import AreasEdit from './Edit';

export default () => ({
  path: '/admin/settings/areas',
  name: 'admin settings areas',
  component: SettingsContainer,
  indexRoute: {
    name: 'admin setting areas index',
    component: AreasIndex,
  },
  childRoutes: [
    {
      path: '/admin/settings/areas/new',
      name: 'admin setting areas new',
      component: AreasNew,
    },
    {
      path: '/admin/settings/areas/:areaId',
      name: 'admin setting area edit',
      component: AreasEdit,
    },
  ],
});
