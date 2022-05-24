# frozen_string_literal: true

FactoryBot.define do
  factory :verification, class: 'Verification::Verification' do
    user
    hashed_uid { '7c18cce107584e83c4e3a5d5ed336134dd3844bf0b5fcfd7c82a9877709a2654' }
    method_name { 'cow' }
    active { true }
  end
end
