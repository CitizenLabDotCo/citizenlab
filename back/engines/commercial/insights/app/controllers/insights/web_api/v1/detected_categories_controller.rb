# frozen_string_literal: true

module Insights
  module WebApi::V1
    class DetectedCategoriesController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.
      after_action :verify_authorized, only: :index

      def index
        authorize(View.find(params.require(:view_id)), :show?)
        # Temporarily return an empty list of detected categories not to break the front-end.
        render json: { data: [] }
      end
    end
  end
end
