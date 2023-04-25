# frozen_string_literal: true

require 'active_support/core_ext/hash/indifferent_access'
require 'nlp/text_network/node'
require 'nlp/text_network/link'
require 'nlp/text_network/community'

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

    def namespace(prefix, sep = '/')
      nodes.each { |node| node.id = [prefix, node.id].join(sep) }
      communities.each { |community| community.id = [prefix, community.id].join(sep) }

      self
    end

    # Keeps only most important communities (in place).
    #
    # @param [Integer] n maximum number of communities
    # @return [Array<NLP::TextNetwork::Community>] removed communities
    def prune_communities(n)
      return [] if n >= communities.length

      keep = communities.sort_by(&:importance_score).reverse.take(n).to_set(&:id)
      @communities, removed = communities.partition { |c| keep.include?(c.id) }
      remove_nodes(removed.flat_map(&:children), update_communities: false)

      removed
    end

    # Keeps only most important nodes (in place).
    #
    # @param [Integer] n maximum number of nodes
    # @return [Array<NLP::TextNetwork::Node>] removed nodes
    def prune_keywords(n)
      return [] if n >= nodes.length

      removed = nodes.sort_by(&:importance_score).reverse.drop(n)
      remove_nodes(removed)

      removed
    end

    # Removes nodes that do not belong to any community (in place).
    #
    # @return [Array<NLP::TextNetwork::Node>] removed nodes
    def remove_orphan_nodes
      community_nodes = communities.flat_map(&:children_ids).to_set
      orphan_nodes = nodes.reject { |n| community_nodes.include?(n.id) }
      remove_nodes(orphan_nodes, update_communities: false)

      orphan_nodes
    end

    # @param [Integer] n maximum number of child nodes per community
    def shrink_communities(n)
      removed_nodes = communities.flat_map { |c| c.shrink(n) }
      remove_nodes(removed_nodes, update_communities: false)
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

    def add_community(id, children_ids, importance_score)
      children = children_ids.map { |children_id| node(children_id) }
      communities << Community.new(id, children, importance_score)
    end

    def add_link(from_id, to_id, weight)
      from_node = node(from_id)
      to_node = node(to_id)

      links << Link.new(from_node, to_node, weight)
    end

    private

    def remove_nodes(nodes, update_links: true, update_communities: true)
      @nodes.except!(*nodes.map(&:id))
      send(:update_links) if update_links
      send(:update_communities) if update_communities
    end

    def update_links
      @links.select! do |link|
        @nodes.key?(link.from_id) && @nodes.key?(link.to_id)
      end
    end

    def update_communities
      communities.each do |c|
        c.children.select! { |node| @nodes.key?(node.id) }
      end

      communities.reject! { |c| c.children.blank? }
    end
  end
end
