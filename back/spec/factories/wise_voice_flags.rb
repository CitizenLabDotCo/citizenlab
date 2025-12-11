# frozen_string_literal: true

FactoryBot.define do
  factory :wise_voice_flag do
    flaggable { association(:idea) }
    role_multiloc { { 'en' => 'doctor' } }
    quotes { ['As a doctor'] }
  end
end
