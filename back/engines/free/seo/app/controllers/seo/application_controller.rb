# frozen_string_literal: true

module Seo
  class ApplicationController < ActionController::Base
    include OutletRenderer

    protect_from_forgery with: :exception

    before_action :set_host

    layout false

    def sitemap
      statuses = %w[published archived]
      @projects = Project.select(
        :'projects.id', :'projects.slug', :'projects.visible_to',
        :'projects.updated_at', :'projects.process_type', :'admin_publications.publication_status',
        :'admin_publications.publication_type', :'admin_publications.publication_id'
      ).includes(:admin_publication).where(visible_to: 'public', admin_publications: { publication_status: statuses })
      @folders = ProjectFolders::Folder.select(
        :'project_folders_folders.id', :'project_folders_folders.slug',
        :'project_folders_folders.updated_at', :'admin_publications.publication_status',
        :'admin_publications.publication_type', :'admin_publications.publication_id'
      ).includes(:admin_publication).where(admin_publications: { publication_status: %w[published archived] })
      @initiatives = Initiative.select(:slug, :updated_at, :publication_status).where(publication_status: statuses)
      @pages = StaticPage.select(:slug, :updated_at)
      @ideas = Idea.select(:slug, :updated_at, :project_id).where(project_id: @projects.map(&:id))
    end

    def robots; end

    private

    def set_host
      @host = Rails.env.development? ? 'localhost' : request.host
    end
  end
end
