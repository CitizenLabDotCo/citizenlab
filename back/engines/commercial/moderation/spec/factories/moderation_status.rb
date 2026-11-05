# frozen_string_literal: true

FactoryBot.define do
  factory :moderation_status, class: 'Moderation::ModerationStatus' do
    association :moderatable, factory: :idea
    status { 'read' }
  end
end
