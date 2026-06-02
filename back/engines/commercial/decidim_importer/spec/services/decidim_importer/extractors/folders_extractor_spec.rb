# frozen_string_literal: true

require 'rails_helper'
require_relative '../../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::Extractors::FoldersExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  it 'maps a process group to a folder with multiloc title/description' do
    rows = [{
      'uid' => 'decidim-participatoryprocessgroup-1',
      'title' => '{"en":"Env.","fr":"Environnement"}',
      'description' => '{"en":"<p>Green</p>","fr":"<p>Vert</p>"}',
      'hero_image' => 'http://localhost/hero.png',
      'created_at' => '2020-01-01', 'updated_at' => '2020-01-01'
    }]

    attrs = extract(rows).first.attributes

    expect(attrs['title_multiloc']).to eq('en' => 'Env.', 'fr-FR' => 'Environnement')
    expect(attrs['description_multiloc']['fr-FR']).to include('Vert')
    expect(attrs['admin_publication_attributes']).to eq('publication_status' => 'published')
    expect(attrs['remote_header_bg_url']).to eq 'http://localhost/hero.png'
  end

  it 'registers folders by their uid for cross-file joins' do
    extract([{ 'uid' => 'decidim-participatoryprocessgroup-9', 'title' => '{"fr":"X"}' }])
    expect(ref_map.fetch('decidim-participatoryprocessgroup-9')).to be_present
  end

  context 'with the real Decidim export fixture' do
    let(:records) do
      extract(
        DecidimImporter::CsvReader.read(
          File.join(
            DecidimImporter::DecidimExportFixture.csv_root,
            'participatory-processes/01--participatory-process-groups.csv'
          )
        )
      )
    end

    it 'maps every group in the export' do
      expect(records.size).to eq(2)
      uids = records.map(&:key)
      expect(uids).to include('decidim-participatoryprocessgroup-1', 'decidim-participatoryprocessgroup-2')
    end
  end
end
