# frozen_string_literal: true

module ImpactTracking
  module WebApi::V1
    class PageviewsController < ::ApplicationController
      skip_before_action :authenticate_user, only: :create
      skip_after_action :verify_authorized, only: :create

      # POST /sessions/:id/track_pageview
      def create
        return head(:not_found) unless Session.exists?(params[:id])

        path = pageview_params[:client_path]
        route = pageview_params[:route]

        project_id = derive_project_id(path, route)

        pageview = Pageview.create(
          session_id: params[:id],
          path: path,
          project_id: project_id
        )

        if pageview
          head :created
        else
          head :internal_server_error
        end
      end

      private

      def pageview_params
        params.require(:pageview).permit(
          :client_path, # This cannot be called 'path' because that's already a thing in rails
          :route
        )
      end

      def derive_project_id(path, route)
        return if route.blank?

        if route.include? 'projects/:slug'
          return get_project_from_project_slug(path)&.id
        end

        if route.include? 'ideas/:slug'
          get_project_from_idea_slug(path)&.id
        end
      end

      def get_project_from_project_slug(path)
        routes = path.split('/')
        projects_index = routes.find_index('projects')
        project_slug = routes[projects_index + 1] if projects_index

        return unless project_slug

        Project.find_by(slug: project_slug)
      end

      def get_project_from_idea_slug(path)
        routes = path.split('/')
        ideas_index = routes.find_index('ideas')
        ideas_slug = routes[ideas_index + 1] if ideas_index

        return unless ideas_slug

        Idea.find_by(slug: ideas_slug)&.project
      end
    end
  end
end
