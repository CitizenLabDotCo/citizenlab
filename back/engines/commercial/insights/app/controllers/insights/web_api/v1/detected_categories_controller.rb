# frozen_string_literal: true

module Insights
  module WebApi::V1
    class DetectedCategoriesController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.
      after_action :verify_authorized

      def index
        render json: dummy_detected_categories
      end

      private

      def view
        @view ||= authorize(
          View.includes(:categories).find(params.require(:view_id)),
          :show?
        )
      end

      def dummy_detected_categories
        {
          data: {
            names: hardcoded_category_names - view.categories.pluck(:name)
          }
        }
      end

      def hardcoded_category_names
        %w[housing rental city home rent tax people income vancouver build new need affordable cost live building unit provide money help low family support pay house]
      end
    end
  end
end
