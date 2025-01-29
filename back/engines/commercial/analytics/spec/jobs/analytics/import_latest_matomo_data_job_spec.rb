# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::ImportLatestMatomoDataJob do
  before do
    # Configure Matomo on the test tenant
    settings = AppConfiguration.instance.settings
    settings['matomo'] = {
      'tenant_site_id' => '10',
      'product_site_id' => '2',
      'enabled' => true,
      'allowed' => true
    }
    AppConfiguration.instance.update(settings: settings)

    stub_env({
      'MATOMO_HOST' => 'https://fake.matomo.citizenlab.co',
      'MATOMO_AUTHORIZATION_TOKEN' => 'matomo-token',
      'DEFAULT_MATOMO_TENANT_SITE_ID' => '1'
    })
  end

  describe '.perform_for_all_tenants' do
    it 'enqueues an import job for each tenant' do
      create(:tenant)

      options = { min_duration: 2.days, max_nb_batches: 3, batch_size: 100 }
      described_class.perform_for_all_tenants(**options)

      Tenant.ids.each do |id|
        expect(described_class).to(have_been_enqueued.with(id, options))
      end
    end
  end

  it 'delegates the import to MatomoDataImporter' do
    site_id = AppConfiguration.instance.settings.dig('matomo', 'tenant_site_id')
    min_timestamp = 123_456_789
    options = { min_duration: 2.days, max_nb_batches: 3, batch_size: 100 }

    expect_any_instance_of(Analytics::MatomoDataImporter)
      .to receive(:import).with(site_id, min_timestamp, **options)

    described_class.perform_now(Tenant.current.id, **options, min_timestamp: min_timestamp)
  end

  context 'when no visits has been imported yet' do
    it 'imports data since the tenant creation' do
      min_timestamp = Tenant.current.created_at.to_i

      expect_any_instance_of(Analytics::MatomoDataImporter)
        .to receive(:import).with(anything, min_timestamp, anything)

      described_class.perform_now(Tenant.current.id)
    end
  end

  context 'when visits have already been imported' do
    let!(:visit) { create(:fact_visit) }

    it 'resumes the import at the time of the latest imported visit' do
      min_timestamp = visit.matomo_last_action_time.to_i - described_class::RETROACTIVE_IMPORT

      expect_any_instance_of(Analytics::MatomoDataImporter)
        .to receive(:import).with(anything, min_timestamp, anything)

      described_class.perform_now(Tenant.current.id)
    end
  end

  describe 'MatomoMisconfigurationError' do
    before do
      stub_const('ENV', ENV.to_h.merge(
        'DEFAULT_MATOMO_TENANT_SITE_ID' => AppConfiguration.instance.settings('matomo', 'tenant_site_id')
      ))
    end

    context 'when tenant has active lifecycle' do
      it 'raises an error if the configured matomo site is the default one' do
        expect { described_class.perform_now(Tenant.current.id) }
          .to raise_error(described_class::MatomoMisconfigurationError)
      end
    end

    context 'when tenant has trial lifecycle' do
      before do
        AppConfiguration.instance.settings['core']['lifecycle_stage'] = 'trial'
        AppConfiguration.instance.save!
      end

      it 'raises an error if the configured matomo site is the default one' do
        expect { described_class.perform_now(Tenant.current.id) }
          .to raise_error(described_class::MatomoMisconfigurationError)
      end
    end

    context 'when tenant has demo lifecycle' do
      before do
        AppConfiguration.instance.settings['core']['lifecycle_stage'] = 'demo'
        AppConfiguration.instance.save!(validate: false)
      end

      it 'does not raise an error if the configured matomo site is the default one' do
        # We expect this error to be raised because the Matomo client is not configured.
        # We shouldn't see the MatomoMisconfigurationError, which would be raised before this one.
        expect { described_class.perform_now(Tenant.current.id) }
          .to raise_error(Matomo::Client::MissingBaseUriError)
      end
    end
  end
end
