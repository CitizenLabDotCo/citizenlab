# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::PhasesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:project_uid) { 'decidim-participatoryprocess-100' }

  before do
    ref_map.register(
      project_uid,
      DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } })
    )
  end

  def extractor(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  it 'imports steps as information phases, ordered by position, referencing the project' do
    rows = [
      { 'uid' => 'decidim-step-2', 'decidim_participatory_process' => project_uid,
        'title' => 'B', 'start_date' => '2021-02-02', 'end_date' => '2021-03-01', 'position' => '2' },
      { 'uid' => 'decidim-step-1', 'decidim_participatory_process' => project_uid,
        'title' => 'A', 'start_date' => '2021-01-01', 'end_date' => '2021-02-01', 'position' => '1' }
    ]
    records = extractor(rows).run

    expect(records.map { |r| r.attributes['title_multiloc']['fr-FR'] }).to eq(%w[A B])
    expect(records.first.attributes['participation_method']).to eq('information')
    expect(records.first.attributes['project_ref'])
      .to be(ref_map.fetch(project_uid).attributes)
  end

  it 'skips and reports steps with missing dates' do
    ex = extractor([{ 'uid' => 'decidim-step-9', 'decidim_participatory_process' => project_uid,
                      'title' => 'X', 'position' => '1' }])
    expect(ex.run).to be_empty
    expect(ex.skipped.first).to include(uid: 'decidim-step-9')
  end

  it 'skips steps whose process was not imported' do
    ex = extractor([{ 'uid' => 'decidim-step-9', 'decidim_participatory_process' => 'decidim-participatoryprocess-999',
                      'title' => 'X', 'start_date' => '2021-01-01', 'position' => '1' }])
    expect(ex.run).to be_empty
  end
end
