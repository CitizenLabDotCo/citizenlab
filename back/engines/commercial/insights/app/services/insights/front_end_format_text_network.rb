# frozen_string_literal: true

module Insights
  # = FrontEndFormatTextNetwork
  #
  # This class implements a representation for text networks that is convenient
  # to work with for the front-end.
  class FrontEndFormatTextNetwork
    attr_reader :id

    # @param [Insights::View] view
    def initialize(view)
      @id = "network-#{view.id}"
      @network = NLP::TextNetwork.merge(
        # Namespacing networks wrt to the language to avoid id collisions.
        *view.text_networks.map { |tn| tn.network.namespace(tn.language) }
      )
    end

    # @return [Array<Hash>]
    def nodes
      @nodes ||= self.class.nodes(@network)
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<Hash>]
    def self.nodes(network)
      keyword_nodes(network) + cluster_nodes(network)
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<Hash>]
    def self.cluster_nodes(network)
      network.communities.map do |community|
        {
          id: community.id,
          name: community_name(community),
          val: community.importance_score,
          cluster_id: nil
        }
      end
    end

    # @param [NLP::TextNetwork::Community] community
    # @param [Integer] n
    # @return [String]
    def self.community_name(community, n = 3)
      community.children
               .sort_by(&:importance_score).reverse
               .take(n)
               .map(&:name).join(', ')
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<Hash>]
    def self.keyword_nodes(network)
      network.communities.flat_map do |community|
        community.children.map do |node|
          {
            id: node.id,
            name: node.name,
            val: node.importance_score,
            cluster_id: community.id
          }
        end
      end
    end

    def links
      @links ||= self.class.links(@network)
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<{Symbol=>String}>]
    def self.links(network)
      cluster_membership_links(network) + inter_cluster_links(network)
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<{Symbol=>String}>]
    def self.cluster_membership_links(network)
      network.communities.flat_map do |community|
        community.children.map { |node| { source: community.id, target: node.id } }
      end
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<{Symbol=>String}>]
    def self.inter_cluster_links(network)
      links_index = network.links.group_by do |link|
        [link.from_id, link.to_id].sort
      end

      community_pairs = network.communities.combination(2).select do |c1, c2|
        c1.children_ids.product(c2.children_ids).any? do |id_pair|
          links_index[id_pair.sort]
        end
      end

      community_pairs.map { |c1, c2| { source: c1.id, target: c2.id } }
    end
  end
end
