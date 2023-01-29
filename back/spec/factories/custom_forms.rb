# frozen_string_literal: true

FactoryBot.define do
  factory :custom_form do
    participation_context { create :continuous_project }
  end
end
