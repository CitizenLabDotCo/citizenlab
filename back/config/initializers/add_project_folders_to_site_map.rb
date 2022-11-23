# frozen_string_literal: true

if defined? ::Seo::ApplicationController
  ::Seo::ApplicationController.outlet 'seo.sitemap' do |locals|
    folders = ProjectFolders::Folder
      .select(
        :'project_folders_folders.id', :'project_folders_folders.slug',
        :'project_folders_folders.updated_at', :'admin_publications.publication_status',
        :'admin_publications.publication_type', :'admin_publications.publication_id'
      )
      .includes(:admin_publication).where(admin_publications: { publication_status: %w[published archived] })
    { partial: 'seo/sitemap', locals: { folders: folders, **locals } }
  end
end
