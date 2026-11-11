# frozen_string_literal: true

FactoryBot.define do
  factory :participation_device do
    association :trackable, factory: :idea
    device_hash { SecureRandom.hex(32) }
    device_type { 'desktop_or_other' }
    browser_name { 'Firefox' }
    os_name { 'macOS' }
  end
end
