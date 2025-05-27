# frozen_string_literal: true

module ImpactTracking
  module WebApi::V1
    class SessionsController < ::ApplicationController
      skip_before_action :authenticate_user, only: %i[create]
      skip_after_action :verify_authorized, only: %i[create upgrade]

      before_action :ignore_crawlers
      before_action :set_current_session, only: %i[upgrade]

      def create
        browser = Browser.new(request.user_agent)
        device_type = get_device_type(browser)
        browser_name = browser.name
        os_name = browser.platform.name

        session = Session.create(
          monthly_user_hash: generate_hash,
          highest_role: current_user&.highest_role,
          user_id: current_user&.id,
          referrer: session_params[:referrer],
          device_type: device_type,
          browser_name: browser_name,
          os_name: os_name
        )

        if session
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

      private

      def ignore_crawlers
        disable_crawler_detection = ENV.fetch('DISABLE_CRAWLER_DETECTION', 'false')

        if disable_crawler_detection != 'true'
          detector = CrawlerDetect.new(request.user_agent)
          head :no_content if detector.is_crawler?
        end
      end

      def session_params
        params.require(:session).permit(:referrer)
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

      def get_device_type(browser)
        return 'mobile' if browser.device.mobile?
        return 'tablet' if browser.device.tablet?

        'desktop_or_other'
      end
    end
  end
end
