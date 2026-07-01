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

  def component(uid, method: 'ideation', name: '{"fr":"Propositions"}', published_at: '2023-02-01',
    previously_published: 'true', end_dates: [], **extra)
    { process_uid: process_uid, component_uid: uid, name: name, method: method,
      published_at: published_at, previously_published: previously_published, end_dates: end_dates }.merge(extra)
  end

  # All registered phase records for the project, sorted by start, as [method, start, end] tuples.
  def phases
    ref_map.records
      .select { |r| r.model_name == 'phase' }
      .map { |r| [r.attributes['participation_method'], r.attributes['start_at'], r.attributes['end_at']] }
      .sort_by { |(_, start, _)| start }
  end

  it 'dates a proposals phase from the component publication to its last proposal' do
    projector.run(participation_components: [
      component('c1', published_at: '2023-02-01', end_dates: %w[2023-02-10 2023-02-25])
    ])

    expect(phases).to eq([%w[ideation 2023-02-01 2023-02-25]])
    expect(ref_map.fetch('c1').attributes['title_multiloc']).to eq('fr-FR' => 'Propositions')
  end

  it 'skips a component that was never published' do
    result = projector.run(participation_components: [
      component('c1', published_at: '', previously_published: 'false', end_dates: %w[2023-02-10])
    ])

    expect(phases).to be_empty
    expect(result.skipped.first).to include(component: 'c1', reason: 'never published')
  end

  it 'falls back to the earliest activity as the start when published but without a publication date' do
    projector.run(participation_components: [
      component('c1', published_at: '', previously_published: 'true', end_dates: %w[2023-03-20 2023-03-05])
    ])

    expect(phases).to eq([%w[ideation 2023-03-05 2023-03-20]])
  end

  it 'gives a published component with no activity a minimal one-day phase' do
    projector.run(participation_components: [component('c1', published_at: '2023-02-01', end_dates: [])])

    expect(phases).to eq([%w[ideation 2023-02-01 2023-02-02]])
  end

  it 'skips a component whose process was not imported' do
    result = projector.run(participation_components: [
      component('c1', process_uid: 'decidim-process-999')
    ])

    expect(phases).to be_empty
    expect(result.skipped.first).to include(component: 'c1')
  end

  it 'creates a native_survey phase with the required survey title/button multilocs' do
    survey = component('c1', method: 'native_survey', name: '{"fr":"Questionnaire"}', published_at: '2023-04-01')
    projector.run(participation_components: [survey])

    phase = ref_map.fetch('c1').attributes
    expect(phase['participation_method']).to eq('native_survey')
    expect(phase['native_survey_title_multiloc']).to eq('fr-FR' => 'Questionnaire')
    # The CTA matches the admin UI's default for a new native-survey phase, translated for the locale.
    expect(phase['native_survey_button_multiloc']).to eq('fr-FR' => "Répondre à l'enquête")
  end

  it 'titles the survey phase by the component name and renders the questionnaire title/description into it' do
    survey = component('c1', method: 'native_survey', name: '{"fr":"Questionnaire"}', published_at: '2023-04-01',
      description_heading: { 'fr' => 'Quelle rue pour demain ?' },
      description_body: { 'fr' => '<p>Donnez votre avis.</p>' })
    projector.run(participation_components: [survey])

    phase = ref_map.fetch('c1').attributes
    # The phase is named by the component, not the questionnaire.
    expect(phase['title_multiloc']).to eq('fr-FR' => 'Questionnaire')
    # The questionnaire title becomes an <h2> heading above its description.
    expect(phase['description_multiloc'])
      .to eq('fr-FR' => '<h2>Quelle rue pour demain ?</h2><p>Donnez votre avis.</p>')
  end

  it 'leaves the survey phase without a description when the questionnaire carries none' do
    survey = component('c1', method: 'native_survey', name: '{"fr":"Enquête"}', published_at: '2023-04-01')
    projector.run(participation_components: [survey])

    expect(ref_map.fetch('c1').attributes).not_to have_key('description_multiloc')
  end

  it 'keeps the proposals dates and shifts an overlapping survey back to the nearest free slot' do
    proposals = component('c1', method: 'ideation', published_at: '2023-01-05', end_dates: %w[2023-02-25])
    survey = component('c2', method: 'native_survey', published_at: '2023-01-10', end_dates: %w[2023-01-12])
    projector.run(participation_components: [survey, proposals])

    # Proposals keep their real window; the survey (which wanted 01-10, inside it) shifts back to end
    # where the proposals start, preserving its 2-day length.
    expect(phases).to eq([
      %w[native_survey 2023-01-03 2023-01-05],
      %w[ideation 2023-01-05 2023-02-25]
    ])
  end

  it 'shifts an overlapping survey forward when the nearer free slot is after the proposals' do
    proposals = component('c1', method: 'ideation', published_at: '2023-01-01', end_dates: %w[2023-01-20])
    survey = component('c2', method: 'native_survey', published_at: '2023-01-18', end_dates: %w[2023-01-22])
    projector.run(participation_components: [proposals, survey])

    expect(phases).to eq([
      %w[ideation 2023-01-01 2023-01-20],
      %w[native_survey 2023-01-20 2023-01-24]
    ])
  end

  it 'sequences two overlapping surveys so they never overlap each other' do
    s1 = component('c1', method: 'native_survey', published_at: '2023-03-01', end_dates: %w[2023-03-10])
    s2 = component('c2', method: 'native_survey', published_at: '2023-03-05', end_dates: %w[2023-03-15])
    projector.run(participation_components: [s1, s2])

    layout = phases
    expect(layout.map(&:first)).to eq(%w[native_survey native_survey])
    expect(layout[1][1]).to be >= layout[0][2] # second starts on/after the first's end
  end
end
