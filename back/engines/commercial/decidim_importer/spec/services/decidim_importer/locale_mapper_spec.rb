# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::LocaleMapper do
  it 'maps known two-char Decidim codes onto their default Go Vocal region' do
    mapper = described_class.new
    expect(mapper.map('fr')).to eq('fr-FR')
    expect(mapper.map('nl')).to eq('nl-BE')
    expect(mapper.map('en')).to eq('en')
  end

  it 'falls back to the primary locale for blank or unknown codes' do
    mapper = described_class.new(fallback_locale: 'fr-BE')
    expect(mapper.map('')).to eq('fr-BE')
    expect(mapper.map(nil)).to eq('fr-BE')
    expect(mapper.map('xx')).to eq('fr-BE')
  end

  it "lets the primary locale override the source language's default region" do
    # Importing a French export into a Belgian platform: `fr` should land as fr-BE, not fr-FR.
    mapper = described_class.new(fallback_locale: 'fr-BE')
    expect(mapper.map('fr')).to eq('fr-BE')
    expect(mapper.map('nl')).to eq('nl-BE') # other languages keep their defaults
  end

  it 'lets an explicit mapping win over everything' do
    mapper = described_class.new({ 'fr' => 'fr-CH' }, fallback_locale: 'fr-BE')
    expect(mapper.map('fr')).to eq('fr-CH')
  end
end
