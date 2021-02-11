module Seo
  class ApplicationController < ActionController::Base
    include OutletRenderer

    protect_from_forgery with: :exception

    before_action :set_host

    layout false

    def sitemap
      statuses     = %w[published archived]
      @initiatives = Initiative.select(:slug, :updated_at, :publication_status).where(publication_status: statuses)
      @pages       = Page.select(:slug, :updated_at, :publication_status).where(publication_status: statuses)
      @projects    = Project.select(
        :'projects.id', :'projects.slug', :'projects.visible_to', :'projects.id',
        :'projects.updated_at', :'admin_publications.publication_status',
        :'admin_publications.publication_type', :'admin_publications.publication_id'
      ).includes(:admin_publication).where(visible_to: 'public', admin_publications: { publication_status: statuses })
      @ideas = Idea.select(:slug, :updated_at, :project_id).where(project_id: @projects.map(&:id))
    end

    def robots; end

    private

    def set_host
      @host = Rails.env.development? ? 'localhost' : request.host
    end
  end
end
