# frozen_string_literal: true

FactoryBot.define do
  factory :reactions_verifications_hashed_uid, class: 'Verification::ReactionsVerificationsHashedUid' do
    reaction
    verification_hashed_uid { '7c18cce107584e83c4e3a5d5ed336134dd3844bf0b5fcfd7c82a9877709a2654' }
  end
end
