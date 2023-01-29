# frozen_string_literal: true

require 'rails_helper'
require 'query'

RSpec.describe Analytics::MatomoDataImporter do
  self.file_fixture_path = Analytics::Engine.root.join('spec', 'fixtures', 'files')

  # This group of tests uses the matomo test instance available at https://demo.matomo.cloud
  # to generate fixture data.
  describe '#import' do
    subject(:importer) do
      matomo_client = Matomo::Client.new('https://demo.matomo.cloud', 'anonymous')
      described_class.new(matomo_client: matomo_client)
    end

    let_it_be(:start_time) { Time.utc(2022, 9, 1) }

    let(:site_id) { '1' } # public/test site id on https://demo.matomo.cloud
    let(:max_nb_batches) { 2 }
    let(:batch_size) { 3 }
    let(:options) { { max_nb_batches: max_nb_batches, batch_size: batch_size } }

    before_all do
      # Date dimension must be populated before importing data. Otherwise, the foreign key
      # constraints on date columns in +analytics_fact_visits+ will be violated.
      create(:dimension_date, date: start_time.to_date)
    end

    around do |example|
      cassette_library_dir = Analytics::Engine.root / 'spec' / 'fixtures' / 'vcr_cassettes'
      VcrHelper.use_cassette_library_dir(cassette_library_dir) do
        VCR.use_cassette('analytics_matomo_data_importer') { example.run }
      end
    end

    it 'imports visit data successfully' do
      expect(HTTParty).to receive(:post)
        .exactly(max_nb_batches).times
        .and_call_original

      expect { importer.import(site_id, start_time.to_i, options) }
        .to change(Analytics::FactVisit, :count).by(batch_size * max_nb_batches)
    end

    it 'updates the list of referrers' do
      expect(ErrorReporter).to receive(:report_msg)
      expect { importer.import(site_id, start_time.to_i, options) }
        .to change(Analytics::DimensionReferrerType, :count).by(2)
    end
  end

  describe '#persist_visit_data' do
    let_it_be(:visit_data) { JSON.parse(file_fixture('matomo_visit_batch.json').read) }

    before_all do
      create(:dimension_date, date: Date.new(2022, 9, 8))
      create(:dimension_date, date: Date.new(2022, 10, 3))

      create(:project).update(id: '9ae10575-921b-45a4-bb2f-c9e0a6d19f5a')
      create(:project).update(id: '27e298d2-e12d-47b5-819c-5442a66893b2')

      matomo = Matomo::Client.new('https://localhost', 'dummy-token')
      described_class.new(matomo_client: matomo).persist_visit_data(visit_data)
    end

    # Visits that should have been imported from the visit batch
    let(:visit1) { Analytics::FactVisit.find_by(matomo_visit_id: 1) }
    let(:visit2) { Analytics::FactVisit.find_by(matomo_visit_id: 8) }

    it 'imports visit locales', :aggregate_failures do
      expect(visit1.dimension_locales.pluck(:name)).to contain_exactly('en-US')
      expect(visit2.dimension_locales.pluck(:name)).to contain_exactly('en-UK', 'fr-BE')
    end

    it 'imports visit projects', :aggregate_failures do
      expect(visit1.dimension_projects.ids).to be_empty

      expected_ids = %w[9ae10575-921b-45a4-bb2f-c9e0a6d19f5a 27e298d2-e12d-47b5-819c-5442a66893b2]
      expect(visit2.dimension_projects.ids).to match_array(expected_ids)
    end

    it 'imports visits', :aggregate_failures do
      expect(Analytics::FactVisit.count).to eq(2)

      expect(visit1.attributes).to include(
        'visitor_id' => '37100c326e9baf4e',
        'dimension_user_id' => '61caabce-f7e5-4804-b9df-36d7d7d73e4d',
        'dimension_date_first_action_id' => Date.new(2022, 9, 8),
        'dimension_date_last_action_id' => Date.new(2022, 9, 8),
        'duration' => 1282,
        'pages_visited' => 2,
        'returning_visitor' => false,
        'referrer_name' => 'Google',
        'referrer_url' => 'https://www.google.com/',
        'matomo_visit_id' => 1,
        'matomo_last_action_time' => Time.at(1_662_647_931).utc
      )
      expect(visit1.dimension_referrer_type.key).to eq('search')
      expect(visit1.dimension_referrer_type.name).to eq('Search Engines')

      expect(visit2.attributes).to include(
        'visitor_id' => '567cdcd5ff49c9b3',
        'dimension_user_id' => nil,
        'dimension_date_first_action_id' => Date.new(2022, 10, 3),
        'dimension_date_last_action_id' => Date.new(2022, 10, 3),
        'duration' => 672,
        'pages_visited' => 3,
        'returning_visitor' => true,
        'referrer_name' => nil,
        'referrer_url' => nil,
        'matomo_visit_id' => 8,
        'matomo_last_action_time' => Time.at(1_664_812_536).utc
      )
      expect(visit2.dimension_referrer_type.key).to eq('direct')
      expect(visit2.dimension_referrer_type.name).to eq('Direct Entry')
    end

    it 'updates the list of referrer types' do
      expect(Analytics::DimensionReferrerType.count).to eq(2)
    end

    it 'is idempotent' do
      matomo_client = Matomo::Client.new('https://fake.matomo.citizenlab.co', 'matomo-token')
      importer = described_class.new(matomo_client: matomo_client)

      expect { importer.persist_visit_data(visit_data) }
        .not_to change(Analytics::FactVisit, :count)
    end
  end
end
