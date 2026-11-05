import tabMessages from './components/PagesMenuTabs/messages';

// The "Pages & menu" section was split into two tabs (Pages and Menu), each
// its own page. Sub-pages point their first breadcrumb at the tab they belong
// to, reusing the tab labels as the single source of truth.
export const pagesBreadcrumb = {
  label: tabMessages.pagesTab,
};

export const pagesBreadcrumbLink = {
  to: '/admin/pages-menu/pages',
} as const;

export const menuBreadcrumb = {
  label: tabMessages.menuTab,
};

export const menuBreadcrumbLink = {
  to: '/admin/pages-menu/menu',
} as const;
