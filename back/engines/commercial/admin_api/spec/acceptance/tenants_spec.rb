# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Tenants', admin_api: true do
  explanation 'Tenants represent the different platforms (typically one for each city).'

  header 'Content-Type', 'application/json'
  header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')

  let_it_be(:tenant, reload: true) { create(:tenant) }
  let_it_be(:tenant_id) { tenant.id }

  get 'admin_api/tenants' do
    example_request 'List all tenants' do
      assert_status 200
      expect(json_response_body.size).to eq(2)
    end

    example 'List all tenants except those that are marked as deleted' do
      tenant.update(deleted_at: Time.zone.now)

      do_request

      assert_status 200
      expect(json_response_body.size).to eq(1)
    end
  end

  get 'admin_api/tenants/:tenant_id' do
    example_request 'Get a tenant by ID' do
      assert_status 200
      expect(json_response_body[:host]).to eq(tenant.host)
    end
  end

  patch 'admin_api/tenants/:tenant_id' do
    with_options scope: :tenant do
      parameter :name, 'The name of the tenant'
      parameter :host, 'The host URL of the tenant'
      parameter :logo, 'The logo image of the tenant'
      parameter :settings, 'The tenant settings'
      parameter :style, 'The tenant style definitions'
    end
    ValidationErrorHelper.new.error_fields(self, Tenant)

    before do
      tenant.switch do
        app_config = AppConfiguration.instance
        settings = app_config.settings
        settings['core']['locales'] = ['en']
        app_config.update!(settings: settings)

        tenant.switch { create(:user, locale: 'en') }
      end
    end

    example 'Change host' do
      new_host = "new-#{tenant.host}"
      do_request(tenant: { host: new_host })

      assert_status 200
      expect(tenant.reload.host).to eq(new_host)
      tenant.switch { expect(tenant.configuration.host).to eq(new_host) }
    end

    example 'Rename tenant' do
      new_name = "new-#{tenant.name}"
      do_request(tenant: { name: new_name})

      assert_status 200
      expect(tenant.reload.name).to eq(new_name)
      tenant.switch { expect(tenant.configuration.name).to eq(new_name) }
    end

    example 'Remove logo' do
      tenant.switch do
        AppConfiguration.instance.update!(logo: Rails.root.join('spec/fixtures/logo.png').open)
      end

      do_request(tenant: { logo: nil })

      assert_status 200
      tenant.switch { expect(tenant.configuration.logo).to be_blank }
    end

    example '[error] Updating a tenant to remove locales used by some users', document: false do
      settings = tenant.configuration.settings
      settings['core']['locales'] = ['en-GB']

      do_request tenant: { settings: settings }

      assert_status 422
    end
  end

  patch 'admin_api/tenants/:tenant_id/remove_locale' do
    with_options scope: :tenant do
      parameter :remove_locale, 'Locale to be removed from the tenant settings'
      parameter :replacing_locale, 'Replace references to the removed locale by this locale'
    end
    ValidationErrorHelper.new.error_fields self, Tenant

    before do
      tenant.switch do
        app_config = AppConfiguration.instance
        settings = app_config.settings
        settings['core']['locales'] = %w[en es-ES]
        app_config.update!(settings: settings)

        tenant.switch { create(:user, locale: 'en') }
      end
    end

    let(:remove_locale) { 'en' }
    let(:replacing_locale) { 'es-ES' }

    example_request 'Updating a tenant to remove locales used by some users' do
      assert_status 200
      expect(tenant.configuration.settings('core', 'locales')).to match_array %w[es-ES]
    end
  end

  post 'admin_api/tenants' do
    let(:new_tenant_attrs) { attributes_for(:app_configuration) }

    example 'Create a tenant' do
      do_request tenant: new_tenant_attrs
      expect(response_status).to eq 201
      expect(json_response_body[:host]).to eq(new_tenant_attrs[:host])
    end

    example '[error] Cannot create tenant with host of other tenant' do
      new_tenant_attrs[:host] = tenant.host

      do_request tenant: new_tenant_attrs

      assert_status 422
      expect(json_response_body).to include_response_error(:host, 'taken')
    end

    example '[error] Cannot create tenant with invalid setting' do
      new_tenant_attrs[:settings]['core']['locales'] = ['not-a-valid-locale']

      do_request tenant: new_tenant_attrs

      assert_status 422
      expect(json_response_body[:errors][:settings][0][:error][:human_message])
        .to include("The property '#/core/locales/0' value \"not-a-valid-locale\" did not match")
    end
  end

  delete 'admin_api/tenants/:tenant_id' do
    example_request 'Deleting a tenant', document: false do
      assert_status 200
      expect(tenant.reload.deleted_at).not_to be_nil
    end
  end

  get 'admin_api/tenants/settings_schema' do
    example_request 'Get the json schema for settings' do
      assert_status 200
    end
  end

  get 'admin_api/tenants/style_schema' do
    example_request 'Get the json schema for style' do
      assert_status 200
    end
  end
end
