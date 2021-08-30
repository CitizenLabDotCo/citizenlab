module Insights
  module WebApi::V1
    class StatsInputsController < ::ApplicationController
      def inputs_count
        inputs = Insights::InputsFinder.new(view, counts_params, {paginate: false}).execute
        render json: { count: inputs.count }
      end

      private

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:scope).find(params.require(:view_id)),
          :show?
        )
      end

      def counts_params
        @counts_params ||= params.permit(
          :category,
          :search,
          :processed
        )
      end
    end
  end
end
