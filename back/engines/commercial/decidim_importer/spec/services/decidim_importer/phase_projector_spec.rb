# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::PhaseProjector do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim-process-1' }
  let(:project) do
    DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } })
  end

  before { ref_map.register(process_uid, project) }

  def projector
    described_class.new(ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def register_info_phase(uid, start_at, end_at)
    record = DecidimImporter::Record.new('phase', {
      'title_multiloc' => { 'fr-FR' => uid }, 'participation_method' => 'information',
      'start_at' => start_at, 'end_at' => end_at
    })
    record.reference('project', project)
    ref_map.register(uid, record)
  end

  def component(uid, dates, method: 'ideation', name: '{"fr":"Propositions"}', description: nil)
    { process_uid: process_uid, component_uid: uid, name: name, method: method, dates: dates,
      description: description }
  end

  # All registered phase records for the project, sorted by start, as [method, start, end] tuples.
  def phases
    ref_map.records
      .select { |r| r.model_name == 'phase' }
      .map { |r| [r.attributes['participation_method'], r.attributes['start_at'], r.attributes['end_at']] }
      .sort_by { |(_, start, _)| start }
  end

  it 'projects a proposals component in a process with no steps as one ideation phase over its window' do
    projector.run(step_rows: [], participation_components: [component('c1', %w[2023-02-10 2023-02-25])])

    expect(phases).to eq([%w[ideation 2023-02-10 2023-02-25]])
    expect(ref_map.fetch('c1').attributes['title_multiloc']).to eq('fr-FR' => 'Propositions')
  end

  it 'appends the ideation phase after the information backbone, non-overlapping' do
    register_info_phase('s1', '2023-01-01 01:00:00 +0100', '2023-02-01 01:00:00 +0100')
    step_rows = [{ 'uid' => 's1', 'decidim_participatory_process' => process_uid }]

    projector.run(step_rows: step_rows, participation_components: [component('c1', %w[2023-02-10 2023-02-25])])

    expect(phases).to eq([
      %w[information 2023-01-01 2023-02-01],
      %w[ideation 2023-02-10 2023-02-25]
    ])
  end

  it 'lays out two same-window components as back-to-back sequential ideation phases' do
    components = [component('c1', %w[2023-03-01 2023-03-10]), component('c2', %w[2023-03-01 2023-03-10])]
    projector.run(step_rows: [], participation_components: components)

    layout = phases
    expect(layout.map(&:first)).to eq(%w[ideation ideation])
    # Non-overlapping: the second phase starts on/after the first one's end.
    expect(layout[1][1]).to be >= layout[0][2]
  end

  it 'clips overlapping information steps so they never overlap' do
    register_info_phase('s1', '2023-01-01', '2023-03-01')
    register_info_phase('s2', '2023-02-01', '2023-04-01') # overlaps s1
    step_rows = %w[s1 s2].map { |u| { 'uid' => u, 'decidim_participatory_process' => process_uid } }

    projector.run(step_rows: step_rows, participation_components: [component('c1', %w[2023-05-01 2023-05-10])])

    info = phases.select { |(method, _, _)| method == 'information' }
    info.each_cons(2) { |(_, _, prev_end), (_, next_start, _)| expect(next_start).to be >= prev_end }
  end

  it 'skips a component whose proposals carry no usable date' do
    result = projector.run(step_rows: [], participation_components: [component('c1', [nil, ''])])

    expect(phases).to be_empty
    expect(result.skipped.first).to include(component: 'c1')
  end

  it 'creates an information phase for a page, with the page body as the description' do
    page = component('c1', %w[2023-05-01], method: 'information',
      name: '{"fr":"La concertation"}', description: { 'fr' => '<p>Bienvenue</p>' })
    projector.run(step_rows: [], participation_components: [page])

    phase = ref_map.fetch('c1').attributes
    expect(phase['participation_method']).to eq('information')
    expect(phase['title_multiloc']).to eq('fr-FR' => 'La concertation')
    expect(phase['description_multiloc']).to eq('fr-FR' => '<p>Bienvenue</p>')
  end

  it 'creates a native_survey phase with the required survey title/button multilocs' do
    survey = component('c1', %w[2023-04-01], method: 'native_survey', name: '{"fr":"Questionnaire"}')
    projector.run(step_rows: [], participation_components: [survey])

    phase = ref_map.fetch('c1').attributes
    expect(phase['participation_method']).to eq('native_survey')
    expect(phase['native_survey_title_multiloc']).to eq('fr-FR' => 'Questionnaire')
    expect(phase['native_survey_button_multiloc']).to eq('fr-FR' => 'Submit')
  end
end
