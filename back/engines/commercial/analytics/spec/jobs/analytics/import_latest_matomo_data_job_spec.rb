# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::ImportLatestMatomoDataJob do
  describe '.perform_for_all_tenants' do
    it 'enqueues an import job for each tenant', slow_test: true do
      create(:tenant)

      options = { min_duration: 2.days, max_nb_batches: 3, batch_size: 100 }
      described_class.perform_for_all_tenants(options)

      Tenant.ids.each do |id|
        expect(described_class).to(have_been_enqueued.with(id, options))
      end
    end
  end

  it 'delegates the import to MatomoDataImporter' do
    site_id = AppConfiguration.instance.settings.dig('matomo', 'tenant_site_id')
    from_timestamp = Tenant.current.created_at.to_i - described_class::RETROACTIVE_IMPORT
    options = { min_duration: 2.days, max_nb_batches: 3, batch_size: 100 }

    expect_any_instance_of(Analytics::MatomoDataImporter)
      .to receive(:import).with(site_id, from_timestamp, options)

    described_class.perform_now(Tenant.current.id, options)
  end
end
