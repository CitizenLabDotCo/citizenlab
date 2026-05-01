# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class AnalyticsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index
      after_action :verify_authorized, only: :index

      def index
        authorize :analytics, policy_class: AnalyticsPolicy

        results, errors, paginations = Analytics::MultipleQueries.new(original_url: request.original_url).run(params[:query])

        if errors.present?
          render json: { 'messages' => errors }, status: :bad_request
        else
          render json: { 'data' => { type: 'analytics', attributes: results }, 'links' => paginations }
        end
      end
    end
  end
end
