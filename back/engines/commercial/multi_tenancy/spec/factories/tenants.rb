# frozen_string_literal: true

require 'faker'

FactoryBot.define do
  factory :tenant do
    transient do
      lifecycle { 'active' }
      locales { %w[en nl-BE fr-FR] }
    end

    name { Faker::Address.city }
    sequence(:host) { |n| "tenant-#{n}.citizenlab.co" }
    settings { SettingsService.new.minimal_required_settings(locales: locales, lifecycle_stage: lifecycle) }
  end

  factory :test_tenant, class: 'Tenant' do
    name { 'test-tenant' }
    host { 'example.org' }
    settings do
      SettingsService.new.minimal_required_settings(
        locales: %w[en fr-FR nl-NL],
        lifecycle_stage: 'active'
      ).deep_merge({
        core: {
          organization_name: {
            'en' => 'Liege',
            'nl-NL' => 'Luik',
            'fr-FR' => 'Liege'
          },
          organization_type: 'medium_city'
        },
        initiatives: {
          enabled: true,
          allowed: true,
          voting_threshold: 300,
          days_limit: 90,
          threshold_reached_message: { 'en' => 'Threshold reached' },
          eligibility_criteria: { 'en' => 'Eligibility criteria' }
        }
      })
    end
  end
end
