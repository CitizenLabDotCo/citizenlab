# frozen_string_literal: true

module Insights
  module WebApi::V1
    class DetectedCategoriesController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      def index
        render json: Insights::WebApi::V1::DetectedCategorySerializer.new(detected_categories).serialized_json
      end

      private

      def view
        @view ||= authorize(
          View.includes(:detected_categories).find(params.require(:view_id)),
          :show?
        )
      end


      def detected_categories
        view.detected_categories
      end
    end
  end
end
