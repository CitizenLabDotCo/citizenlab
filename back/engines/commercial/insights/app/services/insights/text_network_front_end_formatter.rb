# frozen_string_literal: true

module Insights
  class TextNetworkFrontEndFormatter
    attr_reader :id

    # @param [Insights::View] view
    def initialize(view)
      @id = "network-#{view.id}"
      @network = NLP::TextNetwork.merge(*view.text_networks.map { |tn| tn.network.namespace(tn.language) })
    end

    def nodes
      @nodes ||= keyword_nodes + cluster_nodes
    end

    def cluster_nodes
      @cluster_nodes ||= @network.communities.map do |community|
        {
          id: community.id,
          name: community_name(community),
          val: community.importance_score,
          cluster_id: nil
        }
      end
    end

    def community_name(community, n = 3)
      community.children.take(n).map(&:name).join(', ')
    end

    def keyword_nodes
      @keyword_nodes ||= @network.communities.flat_map do |community|
        community.children.map { |node| format_node(node, community.id) }
      end
    end

    def format_node(node, cluster_id = nil)
      {
        id: node.id,
        name: node.name,
        val: node.importance_score,
        cluster_id: cluster_id
      }
    end

    def links
      @links ||= cluster_membership_links + inter_cluster_links
    end

    def cluster_membership_links
      @network.communities.flat_map do |community|
        community.children.map { |node| { source: community.id, target: node.id } }
      end
    end

    def inter_cluster_links
      links_index = @network.links.group_by(&:from_id).transform_values { |links| links.index_by(&:to_id) }

      community_pairs = @network.communities.combination(2).select do |c1, c2|
        c1.children_ids.product(c2.children_ids).any? do |id1, id2|
          links_index.dig(id1, id2) || links_index.dig(id2, id1)
        end
      end

      community_pairs.map do |c1, c2|
        { source: c1.id, target: c2.id }
      end
    end
  end
end
