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
    style { {} }
    settings { SettingsService.new.minimal_required_settings(locales: locales, lifecycle_stage: lifecycle) }

    after(:create) do |tenant, evaluator|
      tenant.switch do
        create(:app_configuration,
          id: tenant.id,
          name: tenant.name,
          host: tenant.host,
          settings: evaluator.settings,
          style: evaluator.style,
          updated_at: tenant.updated_at,
          created_at: tenant.created_at,
          lifecycle: evaluator.lifecycle,
          locales: evaluator.locales)
      end
    end
  end

  factory :test_tenant, class: 'Tenant' do
    name { 'test-tenant' }
    host { 'example.org' }
    style { {} }
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
          reacting_threshold: 300,
          days_limit: 90,
          threshold_reached_message: { 'en' => 'Threshold reached' },
          eligibility_criteria: { 'en' => 'Eligibility criteria' },
          posting_tips: { 'en' => 'Posting tips' }
        },
        user_confirmation: {
          enabled: false,
          allowed: false
        },
        verification: {
          enabled: false,
          allowed: false
        }
      })
    end

    after(:create) do |tenant, evaluator|
      tenant.switch do
        create(:test_app_configuration,
          id: tenant.id,
          name: tenant.name,
          host: tenant.host,
          settings: evaluator.settings,
          style: evaluator.style,
          updated_at: tenant.updated_at,
          created_at: tenant.created_at)
      end
    end
  end
end
