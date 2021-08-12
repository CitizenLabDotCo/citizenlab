# frozen_string_literal: true

require 'active_support/core_ext/hash/indifferent_access'

module NLP
  class TextNetwork
    class << self
      def from_json(json_network)
        json_network = JSON.parse(json_network) if json_network.is_a?(String)

        text_network = json_network.fetch('text_network')
        nodes = text_network['nodes'].map { |json_node| Node.new(json_node['id'], json_node['pagerank']) }

        new(nodes, directed: text_network['directed']).tap do |network|
          # Adding links
          text_network.fetch('links', []).each do |json_link|
            network.add_link(json_link['source'], json_link['target'], json_link['weight'])
          end

          # Adding communities
          json_network.fetch('communities', []).each do |json_community|
            network.add_community(
              json_community['partitions_id'],
              json_community['influent_nodes'],
              json_community['relative_size']
            )
          end
        end
      end

      def merge(*networks)
        is_directed = merge_directed?(networks)
        nodes = networks.flat_map(&:nodes)
        links = networks.flat_map(&:links)
        communities = networks.flat_map(&:communities)

        raise 'Node identifier collision' if duplicates?(nodes.map(&:id))
        raise 'Community identifier collision' if duplicates?(communities.map(&:id))

        new(nodes, links, communities, directed: is_directed)
      end

      private

      def merge_directed?(networks)
        is_directed = networks.map(&:directed?).uniq
        raise 'Cannot merge a directed networks with an undirected networks' if is_directed.size > 1

        is_directed.first
      end

      def duplicates?(objects)
        objects.uniq.size < objects.size
      end
    end

    attr_accessor :links, :communities

    def initialize(nodes, links = [], communities = [], directed: true)
      @nodes = nodes.index_by(&:id)
      @links = links
      @communities = communities
      @directed = directed
    end

    def nodes
      @nodes.values
    end

    def node(id)
      @nodes.fetch(id)
    end

    def directed?
      @directed
    end

    def add_link(from_id, to_id, weight)
      from_node = node(from_id)
      to_node = node(to_id)

      links << Link.new(from_node, to_node, weight)
    end

    def add_community(id, children_ids, importance_score)
      children = children_ids.map { |children_id| node(children_id) }
      communities << Community.new(id, children, importance_score)
    end

    def namespace(prefix, sep = '/')
      nodes.each { |node| node.id = [prefix, node.id].join(sep) }
      communities.each { |community| community.id = [prefix, community.id].join(sep) }

      self
    end

    def ==(other)
      nodes == other.nodes &&
        links == other.links &&
        communities == other.communities &&
        directed? == other.directed?
    end

    def as_json(_options = nil)
      {
        text_network: {
          directed: directed?,
          nodes: nodes.map(&:as_json),
          links: links.map(&:as_json)
        },
        communities: communities.map(&:as_json)
      }.with_indifferent_access
    end

    def inspect
      "#<NLP::TextNetwork nb_nodes=#{nodes.size}, nb_links=#{links.size}, nb_communities=#{communities.size}>"
    end

    class Node
      attr_reader :name, :importance_score
      attr_accessor :id

      # @param [String] id
      # @param [Numeric] importance_score
      def initialize(id, importance_score)
        @id = id
        @name = id
        @importance_score = importance_score
      end

      def as_json(_options = nil)
        { id: name, pagerank: importance_score }.with_indifferent_access
      end

      def ==(other)
        return true if equal?(other)

        id == other.id && importance_score == other.importance_score
      end
    end

    class Link
      attr_reader :from_node, :to_node, :weight

      # @param [Node] from_node
      # @param [Node] to_node
      # @param [Numeric] weight
      def initialize(from_node, to_node, weight)
        @from_node = from_node
        @to_node = to_node
        @weight = weight
      end

      def from_id
        from_node.id
      end

      def to_id
        to_node.id
      end

      def as_json(_options = nil)
        { source: from_node.id, target: to_node.id, weight: weight }.with_indifferent_access
      end

      def ==(other)
        from_node == other.from_node && to_node == other.to_node && weight == other.weight
      end
    end

    class Community
      attr_reader :children, :importance_score
      attr_accessor :id

      # @param [String] id
      # @param [Array<NLP::TextNetwork::Node>] children
      # @param [Numeric] importance_score
      def initialize(id, children, importance_score)
        @id = id
        @children = children
        @importance_score = importance_score
      end

      def children_ids
        children.map(&:id)
      end

      def as_json(_options = nil)
        {
          partitions_id: id,
          influent_nodes: children_ids,
          relative_size: importance_score
        }.with_indifferent_access
      end

      def ==(other)
        id == other.id &&
          importance_score == other.importance_score &&
          children == other.children
      end
    end
  end
end
