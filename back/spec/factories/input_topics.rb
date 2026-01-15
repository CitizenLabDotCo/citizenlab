# frozen_string_literal: true

FactoryBot.define do
  factory :input_topic do
    transient do
      locales { %w[en nl-BE] }
    end

    project
    sequence(:title_multiloc) { |n| locales.index_with { |l| "Input Topic #{n} (#{l})" } }
    sequence(:description_multiloc) { |n| locales.index_with { |l| "Input Topic-#{n} description (#{l})" } }

    icon { 'medical' }

    factory :input_topic_nature do
      title_multiloc { { 'en' => 'Nature' } }
    end

    factory :input_topic_waste do
      title_multiloc { { 'en' => 'Waste' } }
    end

    factory :input_topic_sustainability do
      title_multiloc { { 'en' => 'Sustainability' } }
    end

    factory :input_topic_mobility do
      title_multiloc { { 'en' => 'Mobility' } }
    end

    factory :input_topic_technology do
      title_multiloc { { 'en' => 'Technology' } }
    end

    factory :input_topic_economy do
      title_multiloc { { 'en' => 'Economy' } }
    end
  end
end
