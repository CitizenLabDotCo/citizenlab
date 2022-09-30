# frozen_string_literal: true

module ImpactTracking
  module WebApi::V1
    class SessionsController < ::ApplicationController
      skip_before_action :authenticate_user, only: [:create]
      skip_after_action :verify_authorized, only: %i[create upgrade]

      before_action :ignore_crawlers
      before_action :set_current_session, only: [:upgrade]

      def create
        session = Session.create(
          monthly_user_hash: generate_hash,
          highest_role: current_user&.highest_role
        )

        if session
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
          highest_role: current_user&.highest_role
        )
          head :ok
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

        visitor_hash = SessionHashService.new.generate_for_visitor(request.remote_ip, request.user_agent)
        @session = Session.where(monthly_user_hash: visitor_hash).order(created_at: :desc).first!
      end
    end
  end
end
