# frozen_string_literal: true

FactoryBot.define do
  factory :topic do
    transient do
      locales { %w[en nl-BE] }
    end

    sequence(:title_multiloc) { |n| locales.index_with { |l| "Topic #{n} (#{l})" } }
    sequence(:description_multiloc) { |n| locales.index_with { |l| "Topic-#{n} description (#{l})" } }

    icon { 'medical' }

    factory :topic_nature do
      title_multiloc { { 'en' => 'Nature' } }
    end

    factory :topic_waste do
      title_multiloc { { 'en' => 'Waste' } }
    end

    factory :topic_sustainability do
      title_multiloc { { 'en' => 'Sustainability' } }
    end

    factory :topic_mobility do
      title_multiloc { { 'en' => 'Mobility' } }
    end

    factory :topic_technology do
      title_multiloc { { 'en' => 'Technology' } }
    end

    factory :topic_economy do
      title_multiloc { { 'en' => 'Economy' } }
    end
  end
end
