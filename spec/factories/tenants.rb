require 'faker'

FactoryBot.define do
  factory :tenant do
    name Faker::Address.city
    # host Faker::Internet.domain_name
    host "localhost"
    settings {
      {
        "core" => {
          "enabled" => true,
          "allowed" => true,
          "organization_type" => "medium_city",
          "organization_name" => {
            "en" => Faker::Address.city,
            "nl-BE" => Faker::Address.city,
            "fr-FR" => Faker::Address.city
          },
          "timezone" => "Europe/Brussels",
          "locales" => ["en","nl-BE","fr-FR"],
          "color_main" => "#335533"
        }
      }
    }
  end

  factory :test_tenant, class: Tenant do
    name "test-tenant"
    host "example.org"
    settings {
      {
        "core" => {
          "allowed" => true,
          "enabled" => true,
          "organization_type" => "medium_city",
          "organization_name" => {
            "en" => "Liege",
            "nl-NL" => "Luik",
            "fr-FR" => "Liege"
          },
          "locales" => ["en","fr-FR","nl-NL"],
          "timezone" => "Europe/Brussels",
          "color_main" => "#335533"
        }
      }
    }
  end
end
