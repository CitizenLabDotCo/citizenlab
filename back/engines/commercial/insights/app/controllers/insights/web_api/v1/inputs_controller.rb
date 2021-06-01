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

      # [POST] Replaces category assignments altogether.
      def replace_categories
        ActiveRecord::Base.transaction do
          assignment_service.clear_all_assignments(input, view)
          assignment_service.add_assignments!(input, categories)
        end
        render json: serialize_categories(input), status: :ok
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.details }, status: :unprocessable_entity
      end

      # [PATCH] Adds new category assignments (idempotent).
      def add_categories
        assignments = assignment_service.add_assignments(input, categories)
        errors = assignments.map(&:errors).select(&:any?)
        if errors.present?
          # TODO: Improvement: report all errors, not only the first one.
          render json: { errors: errors.first.details }, status: :unprocessable_entity
        else
          render json: serialize_categories(input), status: :ok
        end
      end

      def delete_categories
        assignments = assignment_service.clear_all_assignments(input, view)
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

      def inputs
        @inputs ||= policy_scope(view.scope.ideas)
      end

      def input
        @input ||= inputs.find(params.require(:id))
      end

      # @return [Array<Insights::CategoryAssignment>]
      def categories
        @categories ||= view.categories.find(
          params.fetch(:data, []).select { |h| h[:type] == 'category' }.pluck(:id)
        )
      end

      def serialize(inputs)
        options = {
          include: %i[categories suggested_categories source],
          fields: { idea: [:title_multiloc] },
          params: fastjson_params
        }

        InputSerializer.new(inputs, options)
      end

      def serialize_categories(input)
        serialize(input).serializable_hash.dig(:data, :relationships, :categories)
      end
    end
  end
end
