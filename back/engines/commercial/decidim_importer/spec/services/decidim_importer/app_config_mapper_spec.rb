# frozen_string_literal: true

require 'rails_helper'
require_relative '../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::AppConfigMapper do
  let(:mapper_locale) { DecidimImporter::LocaleMapper.new }

  def patch_for(row)
    described_class.new(row, locale_mapper: mapper_locale, primary_locale: 'fr-FR').patch
  end

  it 'maps the organization name, locales, timezone, site and from-email onto core settings' do
    row = {
      'name' => '{"en":"Acme City","fr":"Ville Acme"}',
      'description' => '{"en":"<p>Hi</p>","fr":"<p>Salut</p>"}',
      'default_locale' => 'fr',
      'available_locales' => '["en","fr"]',
      'time_zone' => 'Europe/Paris',
      'official_url' => 'https://acme.example',
      'smtp_settings' => '{"from_email":"hello@acme.example","from_label":"Acme"}'
    }

    core = patch_for(row)['settings']['core']

    expect(core['organization_name']).to eq('en' => 'Acme City', 'fr-FR' => 'Ville Acme')
    expect(core['meta_description']).to eq('en' => '<p>Hi</p>', 'fr-FR' => '<p>Salut</p>')
    expect(core['locales']).to eq(%w[fr-FR en]) # default first, mapped, deduped
    expect(core['timezone']).to eq('Europe/Paris')
    expect(core['organization_site']).to eq('https://acme.example')
    expect(core['from_email']).to eq('hello@acme.example')
  end

  it "maps Decidim's friendly time zone onto a Go Vocal IANA identifier, omitting unsupported ones" do
    expect(patch_for('name' => '{"fr":"X"}', 'time_zone' => 'Paris').dig('settings', 'core', 'timezone'))
      .to eq('Europe/Paris')
    expect(patch_for('name' => '{"fr":"X"}', 'time_zone' => 'Nowhere/Bogus').dig('settings', 'core'))
      .not_to have_key('timezone')
  end

  it 'exposes logo and favicon as remote URLs and omits unmapped/blank fields' do
    patch = patch_for(
      'name' => '{"fr":"X"}', 'logo' => 'http://localhost/logo.png',
      'favicon' => 'http://localhost/fav.png', 'official_url' => '',
      'twitter_handler' => 'acme', 'content_security_policy' => '{}'
    )

    expect(patch['remote_logo_url']).to eq('http://localhost/logo.png')
    expect(patch['remote_favicon_url']).to eq('http://localhost/fav.png')
    expect(patch['settings']['core']).not_to have_key('organization_site')
    expect(patch['settings']['core'].keys).to contain_exactly('organization_name')
  end

  it 'returns an empty patch for a missing organization row' do
    expect(patch_for(nil)).to eq({})
  end

  context 'with the real Decidim export fixture' do
    let(:patch) do
      row = DecidimImporter::CsvReader.read(
        File.join(DecidimImporter::DecidimExportFixture.csv_root, '01--organization.csv')
      ).first
      patch_for(row)
    end

    it 'maps the real organization onto core settings' do
      core = patch['settings']['core']
      expect(core['organization_name']).to include('en' => 'Raynor, Heathcote and Moen')
      expect(core['locales']).to eq(%w[fr-FR en])
      expect(core['from_email']).to eq('glennis.tillman@schimmel.example')
      expect(patch['remote_logo_url']).to start_with('http://localhost/rails/active_storage')
    end
  end
end
