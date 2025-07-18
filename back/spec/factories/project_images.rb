# frozen_string_literal: true

FactoryBot.define do
  factory :project_image do
    project
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open }
  end
end
