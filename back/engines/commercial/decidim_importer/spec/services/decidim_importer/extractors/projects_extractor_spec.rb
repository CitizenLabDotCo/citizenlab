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

  it 'falls back to the explicit slug column on older exports that carry no URL' do
    attrs = extract([{ 'uid' => 'p1', 'title' => '{"fr":"P"}', 'slug' => 'ccpsprive' }]).first.attributes
    expect(attrs['slug']).to eq('ccpsprive')
  end

  it 'prefers the URL slug over the slug column when both are present' do
    attrs = extract([{ 'uid' => 'p1', 'title' => '{"fr":"P"}', 'slug' => 'from-column',
                       'url' => 'https://x.fr/processes/from-url' }]).first.attributes
    expect(attrs['slug']).to eq('from-url')
  end

  it 'drops the slug when nothing slug-worthy remains, so the model derives one from the title' do
    attrs = extract([{ 'uid' => 'a1', 'title' => '{"fr":"A"}',
                       'url' => 'https://x.fr/assemblies/---' }]).first.attributes
    expect(attrs).not_to have_key('slug')
  end

  it 'dedupes slugs that only differ by case/punctuation once sanitized, keeping the first claimant' do
    first, second = extract([
      { 'uid' => 'p1', 'title' => '{"fr":"Bac"}', 'url' => 'https://x.fr/processes/Bac-A-Sable' },
      { 'uid' => 'a1', 'title' => '{"fr":"Bac"}', 'url' => 'https://x.fr/assemblies/bac--a--sable' }
    ])

    expect(first.attributes['slug']).to eq('bac-a-sable')
    expect(second.attributes).not_to have_key('slug')
  end

  it 'keeps a Decidim slug only for the first claimant, so a process and assembly sharing one don’t clash' do
    # Decidim lets a process and an assembly share the slug `bacasable`; Go Vocal slugs are global.
    process, assembly = extract([
      { 'uid' => 'p1', 'title' => '{"fr":"Bac"}', 'url' => 'https://x.fr/processes/bacasable' },
      { 'uid' => 'a1', 'title' => '{"fr":"Bac"}', 'url' => 'https://x.fr/assemblies/bacasable' }
    ])

    expect(process.attributes['slug']).to eq('bacasable')
    # The duplicate drops its slug and falls back to Go Vocal's (auto-deduped) title-derived one.
    expect(assembly.attributes).not_to have_key('slug')
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
