# frozen_string_literal: true

module Insights
  module WebApi::V1
    class NetworksController < ::ApplicationController
      def show
        if view.text_networks.present?
          fe_network = Insights::FrontEndFormatTextNetwork.new(view, **style_params)
          render json: Insights::WebApi::V1::NetworkSerializer.new(fe_network).serializable_hash.to_json, status: :ok
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

      def style_params
        # We convert it explicitly to a hash with symbol keys to be able splat
        # it into an argument list +f(**style_params)+.
        @style_params ||= params.permit(:node_size_range, :max_nb_nodes, :max_nb_clusters, :max_density)
          .to_h.symbolize_keys
          .transform_values { |value| JSON.parse(value) }
      end
    end
  end
end
