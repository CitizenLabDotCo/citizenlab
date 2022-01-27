# frozen_string_literal: true

FactoryBot.define do
  factory :nlp_text_network, class: 'NLP::TextNetwork' do
    transient do
      nb_nodes { 5 }
      nb_links { nb_nodes * (nb_nodes - 1) / 4 } # default density = 0.5
      nb_communities { Math.sqrt(nb_nodes).to_i }
    end

    directed { true }
    nodes { Array.new(nb_nodes) { build(:text_network_node) } }

    links do
      nodes.combination(2)
           .take(nb_links)
           .map { |from_node, to_node| build(:text_network_link, from_node: from_node, to_node: to_node) }
    end

    communities do
      groups = nodes.in_groups(nb_communities, false)
      groups.map { |children| build(:text_network_community, children: children) }
    end

    initialize_with { new(nodes, links, communities, directed: directed) }
  end

  factory :text_network_node, class: 'NLP::TextNetwork::Node' do
    sequence(:id) { |n| "node-#{n}" }
    importance_score { Random.rand }

    initialize_with { new(id, importance_score) }
  end

  factory :text_network_link, class: 'NLP::TextNetwork::Link' do
    from_node { raise ArgumentError, "'from_node' argument missing" }
    to_node { raise ArgumentError, "'to_node' argument missing" }
    weight { Random.rand(10) }

    initialize_with { new(from_node, to_node, weight) }
  end

  factory :text_network_community, class: 'NLP::TextNetwork::Community' do
    sequence(:id) { |n| "community-#{n}" }
    children { raise ArgumentError, "'children' argument missing" }
    importance_score { Random.rand(100.0) }

    initialize_with { new(id, children, importance_score) }
  end
end
