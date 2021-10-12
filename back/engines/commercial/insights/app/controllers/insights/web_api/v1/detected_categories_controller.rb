# frozen_string_literal: true

module Insights
  module WebApi::V1
    class DetectedCategoriesController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.
      after_action :verify_authorized, only: :index

      def index
        render json: Insights::WebApi::V1::DetectedCategorySerializer.new(detected_categories).serialized_json
      end

      private

      def view
        @view ||= authorize(
          View.includes(:detected_categories, :categories).find(params.require(:view_id)),
          :show?
        )
      end


      def detected_categories
        category_names = view.categories.map { |category| category.name }
        view.detected_categories.reject { |detected_category| category_names.include?(detected_category.name) }.take(10)
      end
    end
  end
end
