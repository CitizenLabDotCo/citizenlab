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
        @tenant = create(:tenant)
        
        settings = @tenant.settings
        settings['core']['locales'] = ['en']
        @tenant.update!(settings: settings)

        Apartment::Tenant.switch(@tenant.schema_name) do
          create(:user, locale: 'en')
        end
      end

      let(:tenant_id) { @tenant.id }

      example "[error] Updating a tenant to remove locales used by some users", document: false do
        settings = @tenant.settings
        settings['core']['locales'] = ['en-GB']

        do_request tenant: {settings: settings}
        expect(status).not_to eq 200
      end
    end
  end

end