# frozen_string_literal: true

require 'rails_helper'
require 'query'

VCR.configure do |config|
  config.cassette_library_dir = Analytics::Engine.root / 'spec' / 'fixtures' / 'vcr_cassettes'
  config.hook_into :webmock
end

RSpec.describe Analytics::MatomoDataImporter do
  subject(:importer) { described_class.new('https://demo.matomo.cloud', 'anonymous') }

  describe '#import' do
    let_it_be(:start_time) { Time.utc(2022, 9, 1) }

    before_all do
      travel_to(start_time) do
        # Date dimension must be populated before importing data. Otherwise, the foreign
        # key constraints on date columns in +analytics_fact_visits+ will be violated.
        Analytics::PopulateDimensionsService.run
      end
    end

    around do |example|
      VCR.use_cassette('analytics_matomo_data_importer') { example.run }
    end

    it 'imports visit data successfully' do
      site_id = '1' # public/test site id on https://demo.matomo.cloud
      max_nb_batches = 2
      batch_size = 3

      expect(HTTParty).to receive(:post)
        .exactly(max_nb_batches).times
        .and_call_original

      options = { max_nb_batches: max_nb_batches, batch_size: batch_size }

      expect { importer.import(site_id, start_time.to_i, options) }
        .to change(Analytics::FactVisit, :count).by(batch_size * max_nb_batches)
    end
  end
end
