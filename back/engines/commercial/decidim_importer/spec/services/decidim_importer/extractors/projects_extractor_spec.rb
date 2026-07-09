# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ProjectsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  it 'keeps the Decidim slug from a participatory-process URL' do
    attrs = extract([{ 'uid' => 'p1', 'title' => '{"fr":"P"}',
                       'url' => 'https://x.fr/processes/mon-process?foo=1' }]).first.attributes
    expect(attrs['slug']).to eq('mon-process')
  end

  it 'keeps the Decidim slug from an assembly URL' do
    attrs = extract([{ 'uid' => 'a1', 'title' => '{"fr":"A"}',
                       'url' => 'https://x.fr/assemblies/collectifsdequartiers' }]).first.attributes
    expect(attrs['slug']).to eq('collectifsdequartiers')
  end

  it 'nests an assembly under the Assemblies folder via its stamped group' do
    folder = DecidimImporter::Extractors::FoldersExtractor.new(
      [{ 'uid' => DecidimImporter::ExportReader::ASSEMBLIES_FOLDER_UID, 'title' => 'Assemblies' }],
      ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    ).run.first

    attrs = extract([{ 'uid' => 'a1', 'title' => '{"fr":"A"}',
                       'participatory_process_group' => DecidimImporter::ExportReader::ASSEMBLIES_FOLDER_UID }])
      .first.attributes

    expect(attrs['admin_publication_attributes']['parent_attributes_ref'])
      .to be(folder.attributes['admin_publication_attributes'])
  end
end
