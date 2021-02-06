module Seo
  class ApplicationController < ActionController::Base
    protect_from_forgery with: :exception

    before_action :set_host

    layout false

    def sitemap
      @projects    = Project.where(visible_to: 'public', publication_status: 'published')
      @ideas       = Idea.where(project: @projects)
      @initiatives = Initiative.where(publication_status: 'published')
      @pages       = Page.where(publication_status: 'published')
    end

    def robots; end

    private

    def set_host
      @host = Rails.env.development? ? 'localhost' : request.host
    end
  end
end
