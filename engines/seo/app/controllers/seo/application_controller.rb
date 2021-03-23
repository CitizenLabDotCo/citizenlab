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
      @projects    = ProjectPolicy::Scope.new(nil, Project).resolve
      @ideas       = Idea.select(:slug, :updated_at, :project_id).where(project_id: @projects.map(&:id))
    end

    def robots; end

    private

    def set_host
      @host = Rails.env.development? ? 'localhost' : request.host
    end
  end
end
