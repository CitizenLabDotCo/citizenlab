# frozen_string_literal: true

module Insights
  module WebApi::V1
    class NetworksController < ::ApplicationController
      def show
        render json: network, status: :ok
      end

      private

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:scope).find(params.require(:view_id)),
          :show?
        )
      end

      def network
        {
          data: {
            id: "network-of-#{view.id}",
            type: 'network',
            attributes: {
              nodes: [
                {
                  id: "0",
                  clusted_id: nil,
                  name: "komen, fietser, rijden",
                  val: 650,
                },
                {
                  id: "komen",
                  cluster_id: "0",
                  name: "komen",
                  val: 3,
                },
                {
                  id: "fietser",
                  cluster_id: "0",
                  name: "fietser",
                  val: 4,
                },
                {
                  id: "1",
                  clusted_id: nil,
                  name: "kind, school, student",
                  val: 300
                },
                {
                  id: "kind",
                  cluster_id: "1",
                  name: "kind",
                  val: 8.5
                },
                {
                  id: "school",
                  cluster_id: "1",
                  name: "school",
                  val: 1
                },
                {
                  id: "student",
                  cluster_id: "1",
                  name: "student",
                  val: 2
                }
              ],
              links: [
                { source: "0", target: "1" },
                { source: "0", target: "komen" },
                { source: "0", target: "fietser" },
                { source: "1", target: "kind" },
                { source: "1", target: "school" },
                { source: "1", target: "student" }
              ]
            }
          }
        }
      end
    end
  end
end
