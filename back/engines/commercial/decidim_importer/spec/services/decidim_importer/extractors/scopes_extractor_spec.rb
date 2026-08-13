# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ScopesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  def row(overrides = {})
    { 'uid' => 'decidim-scope-1', 'name' => '{"fr":"Quartiers"}', 'parent' => '',
      'created_at' => '2023-06-07 11:24:32 +0200' }.merge(overrides)
  end

  it 'maps each scope to a flat area with its title and a sequential ordering' do
    records = extract([
      row,
      row('uid' => 'decidim-scope-2', 'name' => '{"fr":"Barbusse"}', 'parent' => 'decidim-scope-1')
    ])

    expect(records.map(&:model_name).uniq).to eq(['area'])
    expect(records.map { |r| r.attributes['title_multiloc'] })
      .to eq([{ 'fr-FR' => 'Quartiers' }, { 'fr-FR' => 'Barbusse' }])
    # Hierarchy is flattened (the child keeps no parent) and orderings are unique + sequential.
    expect(records.map { |r| r.attributes['ordering'] }).to eq([0, 1])
  end

  it 'registers areas under their uid and skips nameless scopes' do
    extract([
      row('uid' => 'decidim-scope-9', 'name' => '{"fr":"Laplace"}'),
      row('uid' => 'decidim-scope-10', 'name' => '')
    ])

    expect(ref_map.fetch('decidim-scope-9').model_name).to eq('area')
    expect(ref_map.fetch('decidim-scope-10')).to be_nil
  end
end
