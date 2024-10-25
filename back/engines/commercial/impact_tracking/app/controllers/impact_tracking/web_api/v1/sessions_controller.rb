# frozen_string_literal: true

module ImpactTracking
  module WebApi::V1
    class SessionsController < ::ApplicationController
      skip_before_action :authenticate_user, only: %i[create track_pageview]
      skip_after_action :verify_authorized, only: %i[create upgrade track_pageview]

      before_action :ignore_crawlers
      before_action :set_current_session, only: %i[upgrade]

      def create
        # parsed_ua = DeviceDetector.new(request.user_agent)
        # device_type = parsed_ua.device_type
        # browser_name = parsed_ua.name
        # os_name = parsed_ua.os_name

        session = Session.create(
          monthly_user_hash: generate_hash,
          highest_role: current_user&.highest_role,
          user_id: current_user&.id,
          **session_params.reject { |key| key == 'entry_path' }
        )

        pageview = Pageview.create(
          session_id: session.id,
          path: session_params['entry_path']
        )

        if session && pageview
          side_fx_session_service.after_create(current_user)

          render json: WebApi::V1::SessionSerializer.new(
            session,
            params: jsonapi_serializer_params
          ).serializable_hash, status: :ok
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

      # POST /sessions/:id/track_pageview
      def track_pageview
        return head(:not_found) unless Session.exists?(params[:id])

        pageview = Pageview.create(
          session_id: params[:id],
          path: pageview_params[:page_path]
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

      def session_params
        params.require(:session).permit(
          :referrer,
          :device_type,
          :browser_name,
          :browser_version,
          :os_name,
          :os_version,
          :entry_path
        )
      end

      def pageview_params
        params.require(:pageview).permit(
          :page_path
        )
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
    end
  end
end
