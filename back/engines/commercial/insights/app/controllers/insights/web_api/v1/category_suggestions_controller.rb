# frozen_string_literal: true

module Insights
  module WebApi::V1
    class CategorySuggestionsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      def index
        render json: serialize_suggestions(input), status: :ok
      end

      def destroy
        suggestion = assignment_service.suggested_assignments(input, view)
                                       .find_by!(category_id: params.require(:id))
        status = suggestion.destroy.destroyed? ? :ok : 500
        head status
      end

      def delete_suggestions
        suggestions = assignment_service.suggested_assignments(input, view).destroy_all
        status = suggestions.map(&:destroyed?).all? ? :ok : :internal_server_error
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

      # @return [Hash]
      def serialize_suggestions(input)
        options = { include: %i[suggested_categories], params: fastjson_params({ view: view }) }
        InputSerializer.new(input, options)
                       .serializable_hash
                       .dig(:data, :relationships, :suggested_categories)
      end
    end
  end
end
