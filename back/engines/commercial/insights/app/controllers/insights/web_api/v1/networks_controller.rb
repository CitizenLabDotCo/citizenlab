# frozen_string_literal: true

module Insights
  module WebApi::V1
    class NetworksController < ::ApplicationController
      def show
        fe_network = Insights::TextNetworkFrontEndFormatter.new(view)
        render json: Insights::WebApi::V1::NetworkSerializer.new(fe_network).serialized_json, status: :ok
      end

      private

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:text_networks).find(params.require(:view_id)),
          :show?
        )
      end
    end
  end
end
