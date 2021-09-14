# frozen_string_literal: true

module Insights
  module WebApi::V1
    class NetworksController < ::ApplicationController
      def show
        if view.text_networks.present?
          fe_network = Insights::FrontEndFormatTextNetwork.new(view, **style_params)
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

      def style_params
        # we want a hash with symbol keys to be able splat it into an argument list +f(**style_params)+
        @style_params ||=
          params.permit(keyword_size_range: [], cluster_size_range: []).to_h.symbolize_keys.tap do |p|
            p[:keyword_size_range] = p[:keyword_size_range].map(&:to_f) if p.key?(:keyword_size_range)
            p[:cluster_size_range] = p[:cluster_size_range].map(&:to_f) if p.key?(:cluster_size_range)
          end
      end
    end
  end
end
