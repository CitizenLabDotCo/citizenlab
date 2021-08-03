# frozen_string_literal: true
require 'active_support/core_ext/hash/indifferent_access'

module NLP
  class TextNetwork
    attr_reader :nodes, :links, :communities, :directed

    def initialize(nodes, links, communities, directed = true)
      @nodes = nodes
      @links = links
      @communities = communities
      @directed = directed
    end

    def as_json
      {
        directed: directed,
        text_network: {
          nodes: nodes.map(&:as_json),
          links: links.map(&:as_json)
        },
        communities: communities.map(&:as_json)
      }.with_indifferent_access
    end

    def self.from_json(json_network)
      text_network = json_network.fetch('text_network')
      communities = json_network.fetch('communities')

      new(
        text_network['nodes'].map { |json_node| Node.from_json(json_node) },
        text_network['links'].map { |json_link| Link.from_json(json_link) },
        communities.map { |json_community| Community.from_json(json_community) },
        text_network['directed']
      )
    end

    class Node
      attr_reader :id, :importance_score

      # @param [String] id
      # @param [Numeric] importance_score
      def initialize(id, importance_score)
        @id = id
        @importance_score = importance_score
      end

      def as_json
        { id: id, pagerank: importance_score }.with_indifferent_access
      end

      def self.from_json(json_node)
        new(json_node['id'], json_node['pagerank'])
      end
    end

    class Link
      attr_reader :from_id, :to_id, :weight

      # @param [String] from_id
      # @param [String] to_id
      # @param [Numeric] weight
      def initialize(from_id, to_id, weight)
        @from_id = from_id
        @to_id = to_id
        @weight = weight
      end

      def as_json
        { source: from_id, target: to_id, weight: weight }.with_indifferent_access
      end

      def self.from_json(json_link)
        new(json_link['source'], json_link['target'], json_link['weight'])
      end
    end

    class Community
      attr_reader :id, :children_ids, :importance_score

      # @param [String] id
      # @param [Array<String>] children_ids
      # @param [Numeric] importance_score
      def initialize(id, children_ids, importance_score)
        @id = id
        @children_ids = children_ids
        @importance_score = importance_score
      end

      def as_json
        { 
          partition_id: id, 
          influent_nodes: children_ids, 
          relative_size: importance_score 
        }.with_indifferent_access
      end

      def self.from_json(json_community)
        new(
          json_community['partition_id'],
          json_community['influent_nodes'],
          json_community['relative_size']
        )
      end
    end
  end
end
