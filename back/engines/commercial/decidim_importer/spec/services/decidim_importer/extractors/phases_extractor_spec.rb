# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::PhasesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }

  before do
    ref_map.register(
      'decidim_participatory_processes', '100',
      DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } })
    )
  end

  def extractor(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  it 'imports steps as information phases, ordered by position, referencing the project' do
    rows = [
      { 'id' => '2', 'decidim_participatory_process_id' => '100', 'title' => 'B', 'start_date' => '2021-02-02', 'end_date' => '2021-03-01', 'position' => '2' },
      { 'id' => '1', 'decidim_participatory_process_id' => '100', 'title' => 'A', 'start_date' => '2021-01-01', 'end_date' => '2021-02-01', 'position' => '1' }
    ]
    records = extractor(rows).run

    expect(records.map { |r| r.attributes['title_multiloc']['fr-FR'] }).to eq(%w[A B])
    expect(records.first.attributes['participation_method']).to eq('information')
    expect(records.first.attributes['project_ref'])
      .to be(ref_map.fetch('decidim_participatory_processes', '100').attributes)
  end

  it 'skips and reports steps with missing dates' do
    ex = extractor([{ 'id' => '9', 'decidim_participatory_process_id' => '100', 'title' => 'X', 'position' => '1' }])
    expect(ex.run).to be_empty
    expect(ex.skipped.first).to include(id: '9')
  end

  it 'skips steps whose process was not imported' do
    ex = extractor([{ 'id' => '9', 'decidim_participatory_process_id' => '999', 'title' => 'X', 'start_date' => '2021-01-01', 'position' => '1' }])
    expect(ex.run).to be_empty
  end
end
