# frozen_string_literal: true

module ImpactTracking
  module WebApi::V1
    class SessionsController < ::ApplicationController
      skip_before_action :authenticate_user, only: [:create]
      skip_after_action :verify_authorized, only: %i[create upgrade]

      before_action :ignore_crawlers
      before_action :set_current_session, only: %i[upgrade track_pageview]

      def create
        session = Session.create(
          monthly_user_hash: generate_hash,
          highest_role: current_user&.highest_role,
          user_id: current_user&.id,
          referrer: params['referrer'],
          device_type: params['deviceType'],
          browser_name: params['browserName'],
          browser_version: params['browserVersion'],
          os_name: params['osName'],
          os_version: params['osVersion']
        )

        entry_path = params['entryPath']

        pageview = Pageview.create(
          session_id: session.id,
          path: entry_path
        )

        if session && pageview
          side_fx_session_service.after_create(current_user)

          head :created
        else
          head :internal_server_error
        end
      end

      # PATCH /sessions/current/upgrade
      # Called after the user has authenticated to upgrade its current session
      def upgrade
        if @session.update(
          monthly_user_hash: generate_hash,
          highest_role: current_user&.highest_role,
          user_id: current_user.id
        )

          head :accepted
        else
          head :internal_server_error
        end
      end

      def track_pageview
        pageview = Pageview.create(
          session_id: @session.id,
          path: params[:path],
          route: params[:route]
        )

        if pageview
          head :created
        else
          head :internal_server_error
        end
      end

      private

      def ignore_crawlers
        detector = CrawlerDetect.new(request.user_agent)
        head :no_content if detector.is_crawler?
      end

      def generate_hash
        service = SessionHashService.new
        if current_user
          service.generate_for_user(current_user.id)
        else
          service.generate_for_visitor(request.remote_ip, request.user_agent)
        end
      end

      def set_current_session
        return head(:not_found) unless params[:id] == 'current'

        side_fx_session_service.before_set_current_session(current_user)

        visitor_hash = SessionHashService.new.generate_for_visitor(request.remote_ip, request.user_agent)
        @session = Session.where(monthly_user_hash: visitor_hash).order(created_at: :desc).first!
      end

      def side_fx_session_service
        @side_fx_session_service ||= SideFxSessionService.new
      end

      def entry_project_id(entry_path, entry_route)
        if entry_route.include? 'projects/:slug'
          routes = entry_path.split('/')
          projects_index = routes.find_index('projects')
          entry_project_slug = routes[projects_index + 1] if projects_index

          return unless entry_project_slug

          entry_project = Project.find_by(slug: entry_project_slug)
          return unless entry_project

          entry_project.id
        end
      end
    end
  end
end
