# frozen_string_literal: true

FactoryBot.define do
  factory :default_input_topic do
    transient do
      locales { %w[en nl-BE] }
    end

    sequence(:title_multiloc) { |n| locales.index_with { |l| "Default Input Topic #{n} (#{l})" } }
    sequence(:description_multiloc) { |n| locales.index_with { |l| "Default Input Topic-#{n} description (#{l})" } }

    icon { 'medical' }
  end
end
