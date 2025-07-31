# frozen_string_literal: true

FactoryBot.define do
  factory :idea_image do
    idea
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open }
  end
end
