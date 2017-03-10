require 'faker'

FactoryGirl.define do
  factory :tenant do
    name Faker::Address.city
    # host Faker::Internet.domain_name
    host "localhost"
    settings {
      {
        core: {
          enabled: true,
          allowed: true,
          default_locale: "en"
        }
      }
    }
  end

  factory :test_tenant, class: Tenant do
    name "test-tenant"
    host "example_org"
    settings {
      {
        core: {
          allowed: true,
          enabled: true,
          default_locale: "en",
          organization: {
            en: "Liege",
            nl: "Luik",
            fr: "Liege"
          },
        },
      }
    }
  end
end
