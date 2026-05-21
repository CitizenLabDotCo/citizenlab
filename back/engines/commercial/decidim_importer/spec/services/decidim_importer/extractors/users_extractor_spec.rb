# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::UsersExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  it 'maps a confirmed user with unique_code, mapped locale, bio and demographics' do
    records = extract([{
      'id' => '1', 'name' => 'Marie Curie', 'email' => 'marie@example.fr',
      'confirmed_at' => '2020-01-01', 'locale' => 'fr', 'about' => 'Chercheuse',
      'personal_url' => 'https://marie.example.fr', 'admin' => 'true',
      'gender' => 'female', 'birth_date' => '1967-11-07'
    }])

    attrs = records.first.attributes
    expect(attrs['email']).to eq 'marie@example.fr'
    expect(attrs['locale']).to eq 'fr-FR'
    expect(attrs['unique_code']).to eq 'decidim_users-1'
    expect(attrs['first_name']).to eq 'Marie'
    expect(attrs['last_name']).to eq 'Curie'
    expect(attrs['imported']).to be true
    expect(attrs['roles']).to eq [{ 'type' => 'admin' }]
    expect(attrs['custom_field_values']).to eq({ 'gender' => 'female', 'birthyear' => 1967 })
    expect(attrs['bio_multiloc']['fr-FR']).to include('Chercheuse').and include('https://marie.example.fr')
    expect(attrs['password']).to be_present
  end

  it 'skips deleted, unconfirmed and email-less accounts' do
    rows = [
      { 'id' => '3', 'email' => 'x@y.fr', 'confirmed_at' => '2020', 'deleted_at' => '2021' },
      { 'id' => '4', 'email' => 'z@y.fr' },                # never confirmed
      { 'id' => '5', 'confirmed_at' => '2020' }            # no email
    ]
    expect(extract(rows)).to be_empty
  end

  it 'registers users under their decidim key for later joins' do
    extract([{ 'id' => '7', 'name' => 'Jean', 'email' => 'jean@y.fr', 'confirmed_at' => '2020', 'locale' => 'fr' }])
    expect(ref_map.fetch('decidim_users', '7').attributes['email']).to eq 'jean@y.fr'
  end
end
