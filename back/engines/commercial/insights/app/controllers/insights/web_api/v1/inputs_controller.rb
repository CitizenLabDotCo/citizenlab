# frozen_string_literal: true

module Insights
  module WebApi::V1
    class InputsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: %i[index index_xlsx] # The view is authorized instead.
      after_action :verify_authorized, only: %i[index index_xlsx]

      def show
        render json: InputSerializer.new(input, serialize_options), status: :ok
      end

      def index
        # index is not policy scoped, instead the view is authorized.
        inputs = Insights::InputsFinder.new(view, index_params.merge(paginate: true)).execute
        render json: linked_json(inputs, InputSerializer, serialize_options)
      end

      def index_xlsx
        # index_xlsx is not policy scoped, instead the view is authorized.
        inputs = Insights::InputsFinder.new(view, index_xlsx_params).execute
        view_private_attrs = Pundit.policy!(current_user, User).view_private_attributes?
        xlsx = xlsx_service.generate_inputs_xlsx(inputs, view.categories, view_private_attributes: view_private_attrs)

        xlsx_mime_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        send_data xlsx, type: xlsx_mime_type, filename: 'inputs.xlsx'
      end

      private

      def index_params
        @index_params ||= params.permit(
          :search,
          :sort,
          :processed,
          categories: [],
          keywords: [],
          page: %i[number size]
        )
      end

      def index_xlsx_params
        @index_xlsx_params ||= params.permit(
          :search,
          :processed,
          categories: [],
          keywords: []
        )
      end

      def assignment_service
        @assignment_service ||= Insights::CategoryAssignmentsService.new
      end

      def xlsx_service
        @xlsx_service ||= Insights::XlsxService.new
      end

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:data_sources).find(params.require(:view_id)),
          :show?
        )
      end

      def input
        @input ||= authorize(
          Insights::InputsFinder.new(view).execute.find(params.require(:id))
        )
      end

      def serialize_options
        {
          include: %i[categories suggested_categories source],
          params: jsonapi_serializer_params({ view: view })
        }
      end
    end
  end
end
