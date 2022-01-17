# frozen_string_literal: true

require 'insights/min_max_scaler'

module Insights
  # = FrontEndFormatTextNetwork
  #
  # This class implements a representation for text networks that is convenient
  # to work with for the front-end.
  class FrontEndFormatTextNetwork
    DEFAULT_NODE_SIZE_RANGE = [1, 5].freeze
    MAX_NB_CLUSTERS = 10
    MAX_NB_KEYWORDS = 100

    attr_reader :id

    # @param [Insights::View] view
    def initialize(
      view,
      node_size_range: DEFAULT_NODE_SIZE_RANGE,
      max_nb_nodes: MAX_NB_KEYWORDS
    )
      @id = "network-#{view.id}"
      @node_size_range = node_size_range

      @network = NLP::TextNetwork.merge(
        # Namespacing networks wrt to the language to avoid id collisions.
        *view.text_networks.map { |tn| tn.network.namespace(tn.language) }
      )

      @network.remove_orphan_nodes
      @network.prune_communities(MAX_NB_CLUSTERS)
      @network.prune_keywords(max_nb_nodes)
    end

    # @return [Array<Hash>]
    def nodes
      @nodes ||= self.class.nodes(@network, @node_size_range)
    end

    def links
      @links ||= @network.links
                         .reject { |l| l.from_id == l.to_id }
                         .map(&:as_json)
    end

    class << self

      # @param [NLP::TextNetwork] network
      # @param [Array(Numeric, Numeric)] val_range range of the +val+ attribute after rescaling
      # @return [Array<Hash>]
      def nodes(network, val_range = DEFAULT_NODE_SIZE_RANGE)
        nodes = network.communities.flat_map.with_index do |community, i|
          community.children.map do |node|
            {
              id: node.id,
              name: node.name,
              val: node.importance_score,
              cluster_id: community.id,
              color_index: i
            }
          end
        end

        rescale_node_vals(nodes, val_range)
      end

      def rescale_node_vals(nodes, output_range)
        input_range = nodes.pluck(:val).minmax
        scaler = Insights::MinMaxScaler.new(input_range, output_range)
        nodes.each { |node| node[:val] = scaler.transform(node[:val]) }
      end
    end
  end
end
