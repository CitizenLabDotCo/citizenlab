# frozen_string_literal: true

module Insights
  module WebApi::V1
    class NetworksController < ::ApplicationController
      def show
        if view.text_networks.present?
          fe_network = Insights::FrontEndFormatTextNetwork.new(view)
          render json: Insights::WebApi::V1::NetworkSerializer.new(fe_network).serialized_json, status: :ok
        else
          send_not_found
        end
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
