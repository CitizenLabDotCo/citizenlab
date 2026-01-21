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
  end
end
