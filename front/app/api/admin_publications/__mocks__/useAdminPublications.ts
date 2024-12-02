export { mockFolderChildAdminPublicationsList } from './data';
import { mockFolderChildAdminPublicationsList } from './data';

export const links = {
  self: 'http://localhost:3000/web_api/v1/admin_publications?depth=0\u0026page%5Bnumber%5D=1\u0026page%5Bsize%5D=1000\u0026publication_statuses%5B%5D=published\u0026publication_statuses%5B%5D=archived\u0026remove_not_allowed_parents=true',
  first:
    'http://localhost:3000/web_api/v1/admin_publications?depth=0\u0026page%5Bnumber%5D=1\u0026page%5Bsize%5D=1000\u0026publication_statuses%5B%5D=published\u0026publication_statuses%5B%5D=archived\u0026remove_not_allowed_parents=true',
  last: 'http://localhost:3000/web_api/v1/admin_publications?depth=0\u0026page%5Bnumber%5D=2\u0026page%5Bsize%5D=1000\u0026publication_statuses%5B%5D=published\u0026publication_statuses%5B%5D=archived\u0026remove_not_allowed_parents=true',
  prev: null,
  next: 'http://localhost:3000/web_api/v1/admin_publications?depth=0\u0026page%5Bnumber%5D=2\u0026page%5Bsize%5D=1000\u0026publication_statuses%5B%5D=published\u0026publication_statuses%5B%5D=archived\u0026remove_not_allowed_parents=true',
};

export default jest.fn(() => {
  return {
    data: { pages: [{ data: mockFolderChildAdminPublicationsList, links }] },
  };
});
