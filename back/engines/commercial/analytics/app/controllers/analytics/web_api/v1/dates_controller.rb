# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class DatesController < ::ApplicationController

      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      # GET /dates
      def index
        # dates = DimensionDate.find('all')
        render json: { data: ['test'] }
      end

    end
  end
end
