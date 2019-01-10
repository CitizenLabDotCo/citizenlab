namespace :cl2_back do
  desc "Create a tenant with given host and optional template"
  task :create_tenant, [:host,:template] => [:environment] do |t, args|
    host = args[:host] || raise("Please provide the 'host' arg")
    tenant_template = args[:template] || 'en_tenant_template'

    Tenant.find_by(host: host)&.destroy!

    tenant = Tenant.create!({
      name: host,
      host: host,
      logo: Rails.root.join("spec/fixtures/logo.png").open,
      header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
      settings: {
        core: {
          allowed: true,
          enabled: true,
          locales: ['en-GB','nl-BE'],
          organization_type: 'medium_city',
          organization_name: {
            "en-GB" => 'Wonderville',
            "nl-BE" => 'Mirakelgem',
          },
          timezone: "Europe/Brussels",
          currency: 'EUR',
          color_main: '#732901',
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
        },
        clustering: {
          enabled: true,
          allowed: true
        },
        widgets: {
          enabled: true,
          allowed: true
        },
        manual_emailing: {
          enabled: true,
          allowed: true
        },
        automated_emailing_control: {
          enabled: true,
          allowed: true
        },
        granular_permissions: {
          enabled: true,
          allowed: true
        },
        password_login: {
          enabled: true,
          allowed: true
        },
        participatory_budgeting: {
          enabled: true,
          allowed: true
        },
        similar_ideas: {
          enabled: true,
          allowed: true
        },
        geographic_dashboard: {
          enabled: true,
          allowed: true
        }
      }
    })

    Apartment::Tenant.switch tenant.schema_name do
      TenantTemplateService.new.apply_template(tenant_template)
    end

    SideFxTenantService.new.after_apply_template(tenant, nil)
    SideFxTenantService.new.after_create(tenant, nil)

  end
end