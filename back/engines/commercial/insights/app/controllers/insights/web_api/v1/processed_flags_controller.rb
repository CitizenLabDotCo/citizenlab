# frozen_string_literal: true

module Insights
  module WebApi::V1
    class ProcessedFlagsController < ::ApplicationController

      # [POST] Flag an input as processed.
      def create
        flag = ::Insights::ProcessedFlag.new(input: input, view: view)
        if flag.save
          render status: :created
        else
          render json: { errors: flag.errors.details }, status: :unprocessable_entity
        end
      end

      private

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:data_sources).find(params.require(:view_id)),
          :show?
        )
      end

      def input
        @input ||= Insights::InputsFinder.new(view).execute
                                         .find(params.require(:input_id))
      end
    end
  end
end
