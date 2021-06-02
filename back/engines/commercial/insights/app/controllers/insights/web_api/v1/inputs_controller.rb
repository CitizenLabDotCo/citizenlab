# frozen_string_literal: true

module Insights
  module WebApi::V1
    class InputsController < ::ApplicationController

      def show
        render json: serialize(input), status: :ok
      end

      def index
        render json: serialize(inputs)
      end

      private

      def assignment_service
        @assignment_service ||= Insights::CategoryAssignmentsService.new
      end

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:scope).find(params.require(:view_id)),
          :show?
        )
      end

      def inputs
        @inputs ||= policy_scope(view.scope.ideas)
      end

      def input
        @input ||= inputs.find(params.require(:id))
      end

      def serialize(inputs)
        options = {
          include: %i[categories suggested_categories source],
          fields: { idea: [:title_multiloc] },
          params: fastjson_params
        }

        InputSerializer.new(inputs, options)
      end
    end
  end
end
