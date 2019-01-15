require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Tenants" do

  explanation "Tenants represent the different platforms (typically one for each city)."

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  patch "admin_api/tenants/:tenant_id" do
    with_options scope: :tenant do
      parameter :name, "The name of the tenant"
      parameter :host, "The host URL of the tenant"
      parameter :logo, "The logo image of the tenant"
      parameter :header_bg, "The header background image of the tenant"
      parameter :settings, "The tenant settings"
    end
    ValidationErrorHelper.new.error_fields(self, Tenant)

    describe "" do
      before do
        @tenant = create(:tenant) #, {"name"=>"sebchester", "host"=>"sebchester.localhost", "settings"=>{"core"=>{"allowed"=>true, "enabled"=>true, "organization_type"=>"medium_city", "lifecycle_stage"=>"demo", "timezone"=>"Europe/Brussels", "currency"=>"EUR", "locales"=>["en"], "organization_name"=>{"en"=>"Sebchester"}, "header_title"=>{}, "header_slogan"=>{}, "meta_title"=>{}, "meta_description"=>{}, "color_main"=>"#163A7D", "color_secondary"=>"#E54B4B", "color_text"=>"#163A7D", "signup_helper_text"=>{}, "custom_onboarding_message"=>{}, "custom_onboarding_button"=>{}}, "pages"=>{"allowed"=>true, "enabled"=>true}, "password_login"=>{"allowed"=>true, "enabled"=>true}, "facebook_login"=>{"allowed"=>false, "enabled"=>false}, "google_login"=>{"allowed"=>false, "enabled"=>false}, "azure_ad_login"=>{"allowed"=>false, "enabled"=>false}, "franceconnect_login"=>{"allowed"=>false, "enabled"=>false, "environment"=>"production"}, "integration_onze_stad_app"=>{"allowed"=>false, "enabled"=>false}, "projects"=>{"allowed"=>true, "enabled"=>true}, "projects_phases"=>{"allowed"=>true, "enabled"=>true}, "projects_pages"=>{"allowed"=>true, "enabled"=>true}, "projects_events"=>{"allowed"=>true, "enabled"=>true}, "projects_info"=>{"allowed"=>true, "enabled"=>true}, "excel_export"=>{"allowed"=>true, "enabled"=>true}, "groups"=>{"allowed"=>true, "enabled"=>true}, "private_projects"=>{"allowed"=>true, "enabled"=>true}, "surveys"=>{"allowed"=>true, "enabled"=>true}, "maps"=>{"allowed"=>true, "enabled"=>true, "tile_provider"=>"https://free.tilehosting.com/styles/positron/style.json?key=DIZiuhfkZEQ5EgsaTk6D", "map_center"=>{"lat"=>"50.8503", "long"=>"4.3517"}, "zoom_level"=>12}, "user_custom_fields"=>{"allowed"=>true, "enabled"=>true}, "clustering"=>{"allowed"=>false, "enabled"=>false}, "widgets"=>{"allowed"=>true, "enabled"=>true}, "ideaflow_social_sharing"=>{"allowed"=>true, "enabled"=>true}, "granular_permissions"=>{"allowed"=>false, "enabled"=>false}, "participatory_budgeting"=>{"allowed"=>false, "enabled"=>false}, "manual_emailing"=>{"allowed"=>true, "enabled"=>true}, "automated_emailing_control"=>{"allowed"=>true, "enabled"=>true}, "machine_translations"=>{"allowed"=>true, "enabled"=>true}, "similar_ideas"=>{"allowed"=>true, "enabled"=>false}, "geographic_dashboard"=>{"allowed"=>false, "enabled"=>false}}})
        
        settings = @tenant.settings
        settings['core']['locales'] = ['en']
        @tenant.update!(settings: settings)

        Apartment::Tenant.switch(@tenant.schema_name) do
          create(:user, locale: 'en')
        end
      end

      let(:tenant_id) { @tenant.id }

      example "[error] Updating a tenant to remove locales used by some users", document: false do
        # settings = @tenant.settings
        # settings['core']['locales'] = ['en-GB']
        settings = {"core"=>{"allowed"=>true, "enabled"=>true, "locales"=>["en-GB"], "currency"=>"EUR", "timezone"=>"Europe/Brussels", "color_main"=>"#163A7D", "color_text"=>"#163A7D", "meta_title"=>{}, "header_title"=>{}, "header_slogan"=>{}, "color_secondary"=>"#E54B4B", "lifecycle_stage"=>"demo", "meta_description"=>{}, "organization_name"=>{"en"=>"Sebchester"}, "organization_type"=>"medium_city", "signup_helper_text"=>{}, "custom_onboarding_button"=>{}, "custom_onboarding_message"=>{}}, "maps"=>{"allowed"=>true, "enabled"=>true, "map_center"=>{"lat"=>"50.8503", "long"=>"4.3517"}, "zoom_level"=>12, "tile_provider"=>"https://free.tilehosting.com/styles/positron/style.json?key=DIZiuhfkZEQ5EgsaTk6D"}, "pages"=>{"allowed"=>true, "enabled"=>true}, "groups"=>{"allowed"=>true, "enabled"=>true}, "surveys"=>{"allowed"=>true, "enabled"=>true}, "widgets"=>{"allowed"=>true, "enabled"=>true}, "projects"=>{"allowed"=>true, "enabled"=>true}, "clustering"=>{"allowed"=>false, "enabled"=>false}, "excel_export"=>{"allowed"=>true, "enabled"=>true}, "google_login"=>{"allowed"=>false, "enabled"=>false}, "projects_info"=>{"allowed"=>true, "enabled"=>true}, "similar_ideas"=>{"allowed"=>true, "enabled"=>false}, "azure_ad_login"=>{"allowed"=>false, "enabled"=>false}, "facebook_login"=>{"allowed"=>false, "enabled"=>false}, "password_login"=>{"allowed"=>true, "enabled"=>true}, "projects_pages"=>{"allowed"=>true, "enabled"=>true}, "manual_emailing"=>{"allowed"=>true, "enabled"=>true}, "projects_events"=>{"allowed"=>true, "enabled"=>true}, "projects_phases"=>{"allowed"=>true, "enabled"=>true}, "private_projects"=>{"allowed"=>true, "enabled"=>true}, "user_custom_fields"=>{"allowed"=>true, "enabled"=>true}, "franceconnect_login"=>{"allowed"=>false, "enabled"=>false, "environment"=>"production"}, "geographic_dashboard"=>{"allowed"=>false, "enabled"=>false}, "granular_permissions"=>{"allowed"=>false, "enabled"=>false}, "machine_translations"=>{"allowed"=>true, "enabled"=>true}, "ideaflow_social_sharing"=>{"allowed"=>true, "enabled"=>true}, "participatory_budgeting"=>{"allowed"=>false, "enabled"=>false}, "integration_onze_stad_app"=>{"allowed"=>false, "enabled"=>false}, "automated_emailing_control"=>{"allowed"=>true, "enabled"=>true}}

        do_request tenant: {settings: settings}
        expect(status).not_to eq 200
      end
    end
  end

end