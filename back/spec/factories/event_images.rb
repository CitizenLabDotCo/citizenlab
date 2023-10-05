# frozen_string_literal: true

FactoryBot.define do
  factory :event_image do
    event
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
  end
end
