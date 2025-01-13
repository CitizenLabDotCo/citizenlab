# frozen_string_literal: true

require 'faker'

FactoryBot.define do
  factory :tenant do
    transient do
      lifecycle { 'active' }
      locales { %w[en nl-BE fr-FR] }
    end

    name { Faker::Address.city }
    sequence(:host) { |n| "tenant-#{n}.govocal.com" }
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
    creation_finalized_at { Time.now }
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
          organization_type: 'medium_city',
          onboarding: true
        },
        user_confirmation: {
          enabled: false,
          allowed: false
        },
        verification: {
          enabled: false,
          allowed: false
        },
        follow: {
          enabled: true,
          allowed: true
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
