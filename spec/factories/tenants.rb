require 'faker'

FactoryBot.define do
  factory :tenant do
    name { Faker::Address.city }
    host { "localhost" }
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
          "timezone" => "Brussels",
          "currency" => "EUR",
          "locales" => ["en","nl-BE","fr-FR"],
          "color_main" => "#335533",
          "color_secondary" => Faker::Color.hex_color,
          "color_text" => Faker::Color.hex_color,
          "lifecycle_stage" => "active"
        },
        "initiatives" => {
          "enabled" => true,
          "allowed" => true,
          "voting_threshold" => 300,
          "days_limit" => 90,
          "threshold_reached_message" => {"en" => "Threshold reached"},
          "eligibility_criteria" => {"en" => "Eligibility criteria"},
          "success_stories" => []
        }
      }
    }
  end

  factory :test_tenant, class: Tenant do
    name { "test-tenant" }
    host { "example.org" }
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
          "lifecycle_stage": "active",
          "locales" => ["en","fr-FR","nl-NL"],
          "timezone" => "Brussels",
          "currency" => "EUR",
          "color_main" => "#335533",
          "color_secondary" => Faker::Color.hex_color,
          "color_text" => Faker::Color.hex_color,
          "lifecycle_stage" => "active"
        },
        "initiatives" => {
          "enabled" => true,
          "allowed" => true,
          "voting_threshold" => 300,
          "days_limit" => 90,
          "threshold_reached_message" => {"en" => "Threshold reached"},
          "eligibility_criteria" => {"en" => "Eligibility criteria"},
          "success_stories" => []
        }
      }
    }
  end
end
