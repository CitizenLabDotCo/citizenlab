# frozen_string_literal: true

module Insights
  module WebApi::V1
    class CategoryAssignmentsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      def index
        render json: serialize_categories(input), status: :ok
      end

      def destroy
        assignment = assignment_service.approved_assignments(input, view)
                                       .find_by!(category_id: params.require(:id))
        status = assignment.destroy.destroyed? ? :ok : 500
        head status
      end

      # [POST] Adds new category assignments (idempotent).
      def add_categories
        assignment_service.add_assignments(input, categories)
        render json: serialize_categories(input), status: :ok
      end

      def delete_categories
        assignments = assignment_service.approved_assignments(input, view).destroy_all
        status = assignments.map(&:destroyed?).all? ? :ok : :internal_server_error
        render status: status
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

      def input
        @input ||= view.scope.ideas.find(params.require(:input_id))
      end

      # @return [Array<Insights::Category>]
      def categories
        @categories ||= view.categories.find(
          params.fetch(:data, []).select { |h| h[:type] == 'category' }.pluck(:id)
        )
      end

      # @return [Hash]
      def serialize_categories(input)
        options = { include: %i[categories], params: fastjson_params({ view: view }) }
        InputSerializer.new(input, options)
                       .serializable_hash
                       .dig(:data, :relationships, :categories)
      end
    end
  end
end
