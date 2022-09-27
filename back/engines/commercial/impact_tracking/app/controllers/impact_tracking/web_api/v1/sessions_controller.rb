# frozen_string_literal: true

module ImpactTracking
  module WebApi::V1
    class SessionsController < ::ApplicationController
      skip_before_action :authenticate_user, only: [:create]
      skip_after_action :verify_authorized, only: [:create]

      def create
        unless human?
          head :no_content
          return
        end

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

      private

      def generate_hash
        service = SessionHashService.new
        if current_user
          service.generate_for_user(current_user.id)
        else
          service.generate_for_visitor(request.remote_ip, request.user_agent)
        end
      end

      def human?
        detector = CrawlerDetect.new(request.user_agent)
        !detector.is_crawler?
      end
    end
  end
end
