# frozen_string_literal: true

FactoryBot.define do
  factory :nlp_text_network, class: 'NLP::TextNetwork' do
    transient do
      nb_nodes { 5 }
      nb_links { nb_nodes * (nb_nodes - 1) / 2 }
      nb_communities { Math.sqrt(nb_nodes).to_i }
    end

    directed { true }
    nodes { Array.new(nb_nodes) { build(:text_network_node) } }

    links do
      nodes.map(&:id)
           .permutation(2)
           .take(nb_links)
           .map { |from_id, to_id| build(:text_network_link, from_id: from_id, to_id: to_id) }
    end

    communities do
      groups = nodes.map(&:id).in_groups(nb_communities, false)
      groups.map { |children_ids| build(:text_network_community, children_ids: children_ids) }
    end

    initialize_with { new(nodes, links, communities, directed) }
  end

  factory :text_network_node, class: 'NLP::TextNetwork::Node' do
    sequence(:id) { |n| "node-#{n}" }
    importance_score { Random.rand }

    initialize_with { new(id, importance_score) }
  end

  factory :text_network_link, class: 'NLP::TextNetwork::Link' do
    from_id { raise ArgumentError, "'from_id' argument missing" }
    to_id { raise ArgumentError, "'to_id' argument missing" }
    weight { Random.rand(10) }

    initialize_with { new(from_id, to_id, weight) }
  end

  factory :text_network_community, class: 'NLP::TextNetwork::Community' do
    sequence(:id) { |n| "community-#{n}" }
    children_ids { raise ArgumentError, "'children_ids' argument missing" }
    importance_score { Random.rand(100.0) }

    initialize_with { new(id, children_ids, importance_score) }
  end
end
