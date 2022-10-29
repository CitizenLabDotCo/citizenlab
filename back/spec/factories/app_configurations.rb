# frozen_string_literal: true

require 'faker'

FactoryBot.define do
  factory :app_configuration do
    host { 'localhost' }
    settings do
      {
        'core' => {
          'enabled' => true,
          'allowed' => true,
          'organization_type' => 'medium_city',
          'organization_name' => {
            'en' => Faker::Address.city,
            'nl-BE' => Faker::Address.city,
            'fr-FR' => Faker::Address.city
          },
          'timezone' => 'Brussels',
          'currency' => 'EUR',
          'locales' => %w[en nl-BE fr-FR],
          'color_main' => '#335533',
          'color_secondary' => Faker::Color.hex_color,
          'color_text' => Faker::Color.hex_color
        },
        'customizable_homepage_banner' => {
          'allowed' => true,
          'enabled' => true
        },
        'initiatives' => {
          'enabled' => true,
          'allowed' => true,
          'voting_threshold' => 300,
          'days_limit' => 90,
          'threshold_reached_message' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_threshold_reached_message',
              locales: %i[en nl-BE fr-FR]),
          'eligibility_criteria' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_eligibility_criteria',
              locales: %i[en nl-BE fr-FR])

        }
      }
    end

    initialize_with { AppConfiguration.send(:new, **attributes) }
  end

  factory :test_app_configuration, class: 'AppConfiguration' do
    host { 'example.org' }
    settings do
      {
        'core' => {
          'allowed' => true,
          'enabled' => true,
          'organization_type' => 'medium_city',
          'organization_name' => {
            'en' => 'Liege',
            'nl-NL' => 'Luik',
            'fr-FR' => 'Liege'
          },
          lifecycle_stage: 'active',
          'locales' => %w[en fr-FR nl-NL],
          'timezone' => 'Brussels',
          'currency' => 'EUR',
          'color_main' => '#335533',
          'color_secondary' => Faker::Color.hex_color,
          'color_text' => Faker::Color.hex_color
        },
        'customizable_homepage_banner' => {
          'allowed' => true,
          'enabled' => true
        },
        'initiatives' => {
          'enabled' => true,
          'allowed' => true,
          'voting_threshold' => 300,
          'days_limit' => 90,
          'threshold_reached_message' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_threshold_reached_message',
              locales: %i[en nl-BE fr-FR]),
          'eligibility_criteria' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_eligibility_criteria',
              locales: %i[en nl-BE fr-FR])
        }
      }
    end

    initialize_with { AppConfiguration.send(:new, **attributes) }
  end
end
