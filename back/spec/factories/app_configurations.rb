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
        }
      }
    end

    initialize_with { AppConfiguration.send(:new, **attributes) }
  end
end
