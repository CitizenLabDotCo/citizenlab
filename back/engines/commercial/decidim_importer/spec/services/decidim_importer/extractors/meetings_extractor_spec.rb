# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::MeetingsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'Espaces verts' } }) }

  before { ref_map.register('decidim--process--2', project) }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--meetings--meeting--1', 'title' => '{"fr":"Atelier de quartier"}',
      'description' => '{"fr":"<p>Venez discuter</p>"}', 'location' => '{"fr":"Salle du Conseil"}',
      'address' => '10 av Paul Doumer, 94110 Arcueil', 'latitude' => '48.80633', 'longitude' => '2.33714',
      'online_meeting_url' => '', 'start_time' => '2024-04-25 18:30:00 +0200',
      'end_time' => '2024-04-25 20:00:00 +0200', 'published_at' => '2024-04-18 15:27:45 +0200',
      'withdrawn' => 'false', 'created_at' => '2024-04-18 15:27:28 +0200',
      'updated_at' => '2024-04-18 15:27:45 +0200', 'decidim_participatory_process' => 'decidim--process--2'
    }.merge(overrides)
  end

  it 'builds a project event carrying the meeting title, description, window and address' do
    event = extract([row]).run.first

    expect(event.model_name).to eq('event')
    expect(event.attributes['project_ref']).to be(project.attributes)
    expect(event.attributes['title_multiloc']).to eq('fr-FR' => 'Atelier de quartier')
    expect(event.attributes['description_multiloc']).to eq('fr-FR' => '<p>Venez discuter</p>')
    expect(event.attributes['location_multiloc']).to eq('fr-FR' => 'Salle du Conseil')
    expect(event.attributes['address_1']).to eq('10 av Paul Doumer, 94110 Arcueil')
    expect(event.attributes['start_at']).to eq('2024-04-25 18:30:00 +0200')
    expect(event.attributes['end_at']).to eq('2024-04-25 20:00:00 +0200')
    expect(ref_map.fetch('decidim--meetings--meeting--1')).to eq(event)
  end

  it 'sets the map pin as GeoJSON with longitude first' do
    event = extract([row]).run.first
    expect(event.attributes['location_point_geojson']).to eq('type' => 'Point', 'coordinates' => [2.33714, 48.80633])
  end

  it 'omits the map pin when coordinates are missing or non-numeric' do
    event = extract([row('latitude' => '', 'longitude' => 'n/a')]).run.first
    expect(event.attributes).not_to have_key('location_point_geojson')
  end

  it 'keeps a valid online meeting URL as the online link, dropping non-URLs' do
    online = extract([row('online_meeting_url' => 'https://meet.example/abc')]).run.first
    expect(online.attributes['online_link']).to eq('https://meet.example/abc')

    bogus = extract([row('uid' => 'm2', 'online_meeting_url' => 'à confirmer')]).run.first
    expect(bogus.attributes).not_to have_key('online_link')
  end

  it 'skips a meeting whose process was not imported' do
    extractor = extract([row('decidim_participatory_process' => 'decidim--process--999')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--meetings--meeting--1', reason: 'no project for meeting')
  end

  it 'skips unpublished and withdrawn meetings' do
    expect(extract([row('published_at' => '')]).run).to be_empty
    expect(extract([row('withdrawn' => 'true')]).run).to be_empty
  end

  it 'skips a meeting with no title' do
    extractor = extract([row('title' => '')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first[:reason]).to eq('meeting has no title')
  end
end
