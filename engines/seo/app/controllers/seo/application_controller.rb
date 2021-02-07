module Seo
  class ApplicationController < ActionController::Base
    include OutletRenderer

    protect_from_forgery with: :exception

    before_action :set_host

    layout false

    def sitemap
      statuses     = %w[published archived]
      @initiatives = Initiative.where(publication_status: statuses)
      @ideas       = Idea.where(project: @projects)
      @pages       = Page.where(publication_status: statuses)
      @projects    = Project.includes(:admin_publication)
                            .where(visible_to: 'public', admin_publications: { publication_status: statuses })
    end

    def robots; end

    private

    def set_host
      @host = Rails.env.development? ? 'localhost' : request.host
    end
  end
end
