# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Tenant, type: :model do

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:tenant)).to be_valid
    end
  end

  describe '#switch!' do
    it 'switches successfully into the tenant' do
      tenant = create(:tenant, host: 'unused.hostname.com')
      tenant.switch!
      expect(Tenant.current).to eq(tenant)
    end

    it 'fails when the tenant is not persisted' do
      tenant = build(:tenant, host: 'unused.hostname.com')
      expect { tenant.switch! }.to raise_error(Apartment::TenantNotFound)
    end
  end

  describe '#switch' do
    it 'runs the block in the tenant context' do
      tenant = create(:tenant, host: 'unused.hostname.com')
      current_tenant = tenant.switch { Tenant.current }
      expect(current_tenant).to eq(tenant)
    end

    it 'fails if the tenant is not persisted' do
      tenant = build(:tenant, host: 'unused.hostname.com')
      expect do
        tenant.switch { User.first}
      end.to raise_error(Apartment::TenantNotFound)
    end
  end

  describe 'Apartment tenant' do
    it 'is created on create' do
      host = 'something-else.com' # a different host than the default test tenant
      tenant = create(:tenant, host: host)
      expect { Apartment::Tenant.switch!(tenant.schema_name) }.to_not raise_error(Apartment::TenantNotFound)
    end

    it 'is deleted on destroy' do
      t = create(:tenant, host: 'something.else-than-the-default-test-tenant')
      expect(Apartment::Tenant).to receive(:drop).with(t.host.gsub(/\./, '_'))
      t.destroy
    end

    it 'fails on a duplicate hostname' do
      create(:tenant)
      expect(build(:tenant)).to be_invalid
    end
  end

  describe 'The settings JSON schema' do
    it 'is a valid JSON schema' do
      metaschema = JSON::Validator.validator_for_name('draft4').metaschema
      schema = Tenant.settings_json_schema
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
    end
  end

  describe 'Getting the current tenant' do
    it 'succeeds with the correct tenant' do
      tenant = Tenant.find_by(host: 'example.org')
      expect(Tenant.current).to match(tenant)
    end
  end

  describe 'Getting the settings of the current tenant' do
    it 'succeeds when the setting is available' do
      expect(Tenant.settings('core', 'timezone')).to eq('Brussels')
    end

    it 'raise an error when there is no current tenant' do
      Apartment::Tenant.switch('public') do
        expect { Tenant.settings 'core', 'timezone' }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    it 'returns nil when the setting does not exist' do
      expect(Tenant.settings('core', 'gibberish')).to be_nil
    end
  end

  describe 'Removing a locale from the tenant settings' do
    it 'fails when there are users with the removed locale' do
      tenant = create(:tenant)
      Apartment::Tenant.switch(tenant.schema_name) do
        tenant.settings['core']['locales'] = %w[en nl-BE]
        tenant.save!
        create(:user, locale: 'en')
        tenant.settings['core']['locales'] = ['nl-BE']
        expect(tenant).to be_invalid
      end
    end
  end

  describe 'closest_locale_to' do
    let(:tenant) { create(:tenant, host: 'something.else-than-the-default-test-tenant') }

    it "returns the locale itself if it's present" do
      tenant.settings['core']['locales'] = %w[en nl-BE]
      expect(tenant.closest_locale_to('nl-BE')).to eq 'nl-BE'
    end

    it "returns the first tenant locale when it's not present" do
      tenant.settings['core']['locales'] = %w[en nl-BE]
      expect(tenant.closest_locale_to('de-DE')).to eq 'en'
    end
  end

  describe 'Style' do
    it 'can never be nil' do
      tenant = create(:tenant, host: 'something.else-than-the-default-test-tenant')
      tenant.update(style: nil)
      expect(tenant.style).to eq({})
    end
  end
end
