# frozen_string_literal: true

FactoryBot.define do
  factory :internal_comment do
    author
    association :post, factory: :idea
    parent { nil }
    publication_status { 'published' }
    body { '<p>I think this is a very good idea!</p>' }
  end
end
