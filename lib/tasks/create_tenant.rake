namespace :cl2_back do
  desc "Create a tenant with given host and optional template"
  task :create_tenant, [:host,:template] => [:environment] do |t, args|
    host = args[:host] || raise("Please provide the 'host' arg")
    tenant_template = args[:template] || 'e2etests_template'

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
          color_main: '#163A7D',
          color_secondary: '#CF4040',
          color_text: '#163A7D',
          signup_helper_text: {
            en: 'If you don\'t want to register, use hello@citizenlab.co/democrazy as email/password'
          }
        },
        groups: {
          enabled: true,
          allowed:true
        },
        private_projects: {
          enabled: true,
          allowed: true
        },
        manual_project_sorting: {
          enabled: true,
          allowed: true
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
        },
        surveys: {
          enabled: true,
          allowed: true
        },
        typeform_surveys: {
          enabled: true,
          allowed: true
        },
        google_forms_surveys: {
          enabled: true,
          allowed: true
        },
        surveymonkey_surveys: {
          enabled: true,
          allowed: true
        }
      }
    })


    Apartment::Tenant.switch tenant.schema_name do
      TenantTemplateService.new.resolve_and_apply_template(tenant_template)
      User.create(
        roles: [{type: 'admin'}],
        first_name: 'Citizen',
        last_name: 'Lab',
        email: 'hello@citizenlab.co',
        password: 'democrazy',
        locale: tenant.settings.dig('core', 'locales')&.first || 'en',
        registration_completed_at: Time.now
      )
    end


    SideFxTenantService.new.after_apply_template(tenant, nil)
    SideFxTenantService.new.after_create(tenant, nil)

  end
end
