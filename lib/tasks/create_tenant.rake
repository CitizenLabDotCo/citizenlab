namespace :cl2_back do
  desc "Create a tenant with given host and optional template"
  task :create_tenant, [:host,:template] => [:environment] do |t, args|
    host = args[:host] || raise "Please provide the 'host' arg"
    tenant_template = args[:template] || 'en_tenant_template'

    tenant = Tenant.create!({
      name: host,
      host: host,
      logo: Rails.root.join("spec/fixtures/logo.png").open,
      header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
      settings: {
        core: {
          allowed: true,
          enabled: true,
          locales: ['en','nl-BE'],
          organization_type: 'medium_city',
          organization_name: {
            "en" => Faker::Address.city,
            "nl-BE" => Faker::Address.city,
          },
          timezone: "Europe/Brussels",
          color_main: Faker::Color.hex_color,
        },
        groups: {
          enabled: true,
          allowed:true
        },
        private_projects: {
          enabled: true,
          allowed: true
        },
        surveys: {
         enabled: true,
         allowed: true,
        },
        user_custom_fields: {
          enabled: true,
          allowed: true
        }
      }
    })

    Apartment::Tenant.switch tenant.schema_name do
      TenantTemplateService.apply_template('en_tenant_template')
    end

  end
end