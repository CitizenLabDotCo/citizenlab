# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class ActivitiesController < ::ApplicationController

      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      # GET /total between two dates
      def total
        posts = FactActivity.where(activity_type: ['idea','initiative'])
        render json: posts
      end

    end
  end
end
