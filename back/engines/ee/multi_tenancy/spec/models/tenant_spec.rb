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
      expect(described_class.current).to eq(tenant)
    end

    it 'fails when the tenant is not persisted' do
      tenant = build(:tenant, host: 'unused.hostname.com')
      expect { tenant.switch! }.to raise_error(Apartment::TenantNotFound)
    end
  end

  describe '#switch' do
    it 'runs the block in the tenant context' do
      tenant = create(:tenant, host: 'unused.hostname.com')
      current_tenant = tenant.switch { described_class.current }
      expect(current_tenant).to eq(tenant)
    end

    it 'fails if the tenant is not persisted' do
      tenant = build(:tenant, host: 'unused.hostname.com')
      expect do
        tenant.switch { User.first }
      end.to raise_error(Apartment::TenantNotFound)
    end
  end

  describe '#current' do
    it 'works for tenants marked as deleted' do
      described_class.current.update(deleted_at: Time.zone.now)
      expect { described_class.current }.not_to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'deleted scope' do
    it 'returns deleted tenants' do
      expect { described_class.current.update(deleted_at: Time.zone.now) }
        .to change { described_class.deleted.count }.by(1)
    end
  end

  describe 'not_deleted scope' do
    it 'returns tenants that are not marked as deleted' do
      expect { described_class.current.update(deleted_at: Time.zone.now) }
        .to change { described_class.not_deleted.count }.by(-1)
    end
  end

  describe 'with_lifecycle scope' do
    before_all do
      create(:tenant, lifecycle: 'active') # 2 active tenants with the test-tenant
      create(:tenant, lifecycle: 'churned')
    end

    specify { expect(described_class.with_lifecycle('active').count).to eq(2) }
    specify { expect(described_class.churned.count).to eq(1) }
  end

  describe 'Apartment tenant' do
    it 'is created on create' do
      host = 'something-else.com' # a different host than the default test tenant
      tenant = create(:tenant, host: host)
      expect { Apartment::Tenant.switch!(tenant.schema_name) }.not_to raise_error(Apartment::TenantNotFound)
    end

    it 'is deleted on destroy' do
      t = create(:tenant, host: 'something.else-than-the-default-test-tenant')
      expect(Apartment::Tenant).to receive(:drop).with(t.host.tr('.', '_'))
      t.destroy
    end

    it 'fails on a duplicate hostname' do
      create(:tenant)
      expect(build(:tenant, host: described_class.current.host)).to be_invalid
    end
  end

  describe 'The settings JSON schema' do
    it 'is a valid JSON schema' do
      metaschema = JSON::Validator.validator_for_name('draft4').metaschema
      schema = described_class.settings_json_schema
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
    end
  end

  describe 'Getting the current tenant' do
    it 'succeeds with the correct tenant' do
      tenant = described_class.find_by(host: 'example.org')
      expect(described_class.current).to match(tenant)
    end
  end

  describe 'Getting the settings of the current tenant' do
    it 'succeeds when the setting is available' do
      expect(described_class.settings('core', 'timezone')).to eq('Brussels')
    end

    it 'raise an error when there is no current tenant' do
      Apartment::Tenant.switch('public') do
        expect { described_class.settings 'core', 'timezone' }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    it 'returns nil when the setting does not exist' do
      expect(described_class.settings('core', 'gibberish')).to be_nil
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

    # An OmniAuth response (following SSO with, for example, Google) often includes a
    # 2 character locale code, which we try to match against our longer codes.
    it 'returns the first tenant locale containing a matching 2 character substring' do
      tenant.settings['core']['locales'] = %w[en nl-BE]
      expect(tenant.closest_locale_to('nl')).to eq 'nl-BE'
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
