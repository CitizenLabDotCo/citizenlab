# frozen_string_literal: true

FactoryBot.define do
  factory :global_topic, aliases: [:topic], class: 'GlobalTopic' do
    transient do
      locales { %w[en nl-BE] }
    end

    sequence(:title_multiloc) { |n| locales.index_with { |l| "Topic #{n} (#{l})" } }
    sequence(:description_multiloc) { |n| locales.index_with { |l| "Topic-#{n} description (#{l})" } }

    icon { 'medical' }

    factory :global_topic_nature, aliases: [:topic_nature] do
      title_multiloc { { 'en' => 'Nature' } }
    end

    factory :global_topic_waste, aliases: [:topic_waste] do
      title_multiloc { { 'en' => 'Waste' } }
    end

    factory :global_topic_sustainability, aliases: [:topic_sustainability] do
      title_multiloc { { 'en' => 'Sustainability' } }
    end

    factory :global_topic_mobility, aliases: [:topic_mobility] do
      title_multiloc { { 'en' => 'Mobility' } }
    end

    factory :global_topic_technology, aliases: [:topic_technology] do
      title_multiloc { { 'en' => 'Technology' } }
    end

    factory :global_topic_economy, aliases: [:topic_economy] do
      title_multiloc { { 'en' => 'Economy' } }
    end
  end
end
