# frozen_string_literal: true

module Insights
  module WebApi::V1
    class BatchAssignmentsController < ::ApplicationController

      def assign_categories
        assignment_service.add_assignments_batch(inputs, categories)
        render status: :no_content
      end

      def remove_categories
        assignment_service.delete_assignments_batch(inputs, categories)
        render status: :no_content
      end

      private

      def assignment_service
        @assignment_service ||= Insights::CategoryAssignmentsService.new
      end

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:data_sources).find(params.require(:view_id)),
          :destroy?
        )
      end

      def categories
        @categories ||= view.categories.find(params['categories'])
      end

      def inputs
        @inputs ||= InputsFinder.new(view).execute.find(params['inputs'])
      end
    end
  end
end
