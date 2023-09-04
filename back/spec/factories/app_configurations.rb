# frozen_string_literal: true

require 'faker'

FactoryBot.define do
  factory :app_configuration do
    transient do
      lifecycle { 'active' }
      locales { %w[en nl-BE fr-FR] }
    end

    host { 'localhost' }
    name { Faker::Address.city }

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
          'lifecycle_stage' => lifecycle,
          'timezone' => 'Europe/Brussels',
          'currency' => 'EUR',
          'locales' => locales,
          'color_main' => '#335533',
          'color_secondary' => Faker::Color.hex_color,
          'color_text' => Faker::Color.hex_color,
          'authentication_token_lifetime_in_days' => 30
        },
        'initiatives' => {
          'enabled' => true,
          'allowed' => true,
          'reacting_threshold' => 300,
          'days_limit' => 90,
          'threshold_reached_message' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_threshold_reached_message',
              locales: %i[en nl-BE fr-FR]),
          'eligibility_criteria' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_eligibility_criteria',
              locales: %i[en nl-BE fr-FR]),
          'posting_tips' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_posting_tips',
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
          'lifecycle_stage' => 'active',
          'locales' => %w[en fr-FR nl-NL],
          'timezone' => 'Europe/Brussels',
          'currency' => 'EUR',
          'color_main' => '#335533',
          'color_secondary' => Faker::Color.hex_color,
          'color_text' => Faker::Color.hex_color,
          'authentication_token_lifetime_in_days' => 30,
          'maximum_admins_number' => 10,
          'maximum_moderators_number' => 10
        },
        'initiatives' => {
          'enabled' => true,
          'allowed' => true,
          'reacting_threshold' => 300,
          'days_limit' => 90,
          'threshold_reached_message' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_threshold_reached_message',
              locales: %i[en nl-BE fr-FR]),
          'eligibility_criteria' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_eligibility_criteria',
              locales: %i[en nl-BE fr-FR]),
          'posting_tips' =>
            MultilocService.new.i18n_to_multiloc('initiatives.default_posting_tips',
              locales: %i[en nl-BE fr-FR])
        }
      }
    end

    initialize_with { AppConfiguration.send(:new, **attributes) }
  end
end
