require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Tenants", admin_api: true do

  explanation "Tenants represent the different platforms (typically one for each city)."

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  get "admin_api/tenants" do
    let(:tenant) { create(:tenant) }
    let(:tenant_id) { tenant.id }

    example_request "List all tenants" do
      expect(status).to eq 200
    end
  end

  get "admin_api/tenants/:tenant_id" do
    let(:tenant) { create(:tenant) }
    let(:tenant_id) { tenant.id }

    example_request "Get a tenant by ID" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:host]).to eq 'localhost'
    end
  end

  patch "admin_api/tenants/:tenant_id" do
    with_options scope: :tenant do
      parameter :name, "The name of the tenant"
      parameter :host, "The host URL of the tenant"
      parameter :logo, "The logo image of the tenant"
      parameter :header_bg, "The header background image of the tenant"
      parameter :settings, "The tenant settings"
      parameter :style, "The tenant style definitions"
    end
    ValidationErrorHelper.new.error_fields(self, Tenant)

    describe do
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
        expect(status).to eq 422
      end
    end
  end

  delete "admin_api/tenants/:tenant_id" do
    let(:tenant) { create(:tenant)}
    let(:tenant_id) { tenant.id }

    example_request "Deleting a tenant", document: false do
      expect(status).to eq 200
      expect{tenant.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  get "admin_api/tenants/settings_schema" do
    example_request "Get the json schema for settings" do
      expect(status).to eq 200
    end
  end

  get "admin_api/tenants/style_schema" do
    example_request "Get the json schema for style" do
      expect(status).to eq 200
    end
  end

end