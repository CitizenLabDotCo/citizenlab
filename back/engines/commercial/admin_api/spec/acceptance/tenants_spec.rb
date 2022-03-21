# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Tenants', admin_api: true do
  explanation 'Tenants represent the different platforms (typically one for each city).'

  header 'Content-Type', 'application/json'
  header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')

  let_it_be(:tenant) { create(:tenant) }
  let_it_be(:tenant_id) { tenant.id }

  get 'admin_api/tenants' do
    example_request 'List all tenants' do
      expect(status).to eq 200
      expect(json_response_body.size).to eq(2)
    end

    example 'List all tenants except those that are marked as deleted' do
      tenant.update(deleted_at: Time.zone.now)

      do_request

      expect(status).to eq 200
      expect(json_response_body.size).to eq(1)
    end
  end

  get 'admin_api/tenants/:tenant_id' do
    example_request 'Get a tenant by ID' do
      expect(status).to eq 200
      expect(json_response_body[:host]).to eq(tenant.host)
    end
  end

  patch 'admin_api/tenants/:tenant_id' do
    with_options scope: :tenant do
      parameter :name, 'The name of the tenant'
      parameter :host, 'The host URL of the tenant'
      parameter :logo, 'The logo image of the tenant'
      parameter :header_bg, 'The header background image of the tenant'
      parameter :settings, 'The tenant settings'
      parameter :style, 'The tenant style definitions'
    end
    ValidationErrorHelper.new.error_fields(self, Tenant)

    before do
      settings = tenant.settings
      settings['core']['locales'] = ['en']
      tenant.update!(settings: settings)
      tenant.switch { create(:user, locale: 'en') }
    end

    example '[error] Updating a tenant to remove locales used by some users', document: false do
      settings = tenant.settings
      settings['core']['locales'] = ['en-GB']

      do_request tenant: { settings: settings }

      expect(status).to eq 422
    end
  end

  patch 'admin_api/tenants/:tenant_id/remove_locale' do
    with_options scope: :tenant do
      parameter :remove_locale, 'Locale to be removed from the tenant settings'
      parameter :replacing_locale, 'Replace references to the removed locale by this locale'
    end
    ValidationErrorHelper.new.error_fields self, Tenant

    before do
      settings = tenant.settings
      settings['core']['locales'] = %w[en es-ES]
      tenant.update! settings: settings
      tenant.switch { create(:user, locale: 'en') }
    end

    let(:remove_locale) { 'en' }
    let(:replacing_locale) { 'es-ES' }

    example_request 'Updating a tenant to remove locales used by some users' do
      expect(status).to eq 200
      expect(tenant.reload.settings.dig('core', 'locales')).to match_array %w[es-ES]
    end
  end

  post 'admin_api/tenants' do
    let(:new_tenant) { build(:tenant) }

    example 'Create a tenant' do
      do_request tenant: new_tenant.attributes
      expect(response_status).to eq 201
      expect(json_response_body[:host]).to eq(new_tenant.host)
    end

    example '[error] Cannot create tenant with host of other tenant' do
      new_tenant.host = tenant.host

      do_request tenant: new_tenant.attributes
      expect(response_status).to eq 422
      expect(json_response_body[:errors][:host][0][:error]).to eq('taken')
    end

    example '[error] Cannot create tenant with invalid setting' do
      settings = tenant.settings
      settings['core']['locales'] = ['not-a-valid-locale']
      new_tenant.settings = settings

      do_request tenant: new_tenant.attributes
      expect(response_status).to eq 422
      expect(json_response_body[:errors][:settings][0][:error][:human_message])
        .to include("The property '#/core/locales/0' value \"not-a-valid-locale\" did not match")
    end
  end

  delete 'admin_api/tenants/:tenant_id' do
    example_request 'Deleting a tenant', document: false do
      original_host = tenant.host

      expect(status).to eq 200
      expect(tenant.reload.deleted_at).not_to be_nil
      expect(tenant.reload.host).not_to eq(original_host)
    end
  end

  get 'admin_api/tenants/settings_schema' do
    example_request 'Get the json schema for settings' do
      expect(status).to eq 200
    end
  end

  get 'admin_api/tenants/style_schema' do
    example_request 'Get the json schema for style' do
      expect(status).to eq 200
    end
  end
end
