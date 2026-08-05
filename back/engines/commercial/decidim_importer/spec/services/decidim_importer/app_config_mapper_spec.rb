# frozen_string_literal: true

require 'rails_helper'
require_relative '../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::AppConfigMapper do
  let(:mapper_locale) { DecidimImporter::LocaleMapper.new }

  def patch_for(row)
    described_class.new(row, locale_mapper: mapper_locale, primary_locale: 'fr-FR').patch
  end

  def flags
    {
      'project_static_pages' => { 'allowed' => true, 'enabled' => true },
      'parallel_participation' => { 'allowed' => true, 'enabled' => true }
    }
  end

  it 'maps the organization locales onto core settings (default first, mapped, deduped)' do
    core = patch_for('default_locale' => 'fr', 'available_locales' => '["en","fr"]')['settings']['core']
    expect(core['locales']).to eq(%w[fr-FR en])
  end

  it 'drops locales Go Vocal does not support, so the patch never fails the merge validation' do
    core = patch_for('default_locale' => 'fr', 'available_locales' => '["en","fr","zz-ZZ"]')['settings']['core']
    # `zz-ZZ` is a regioned code with no override, so it passes through the mapper unchanged and is
    # then filtered out as unsupported, leaving only the supported locales.
    expect(core['locales']).to eq(%w[fr-FR en])
  end

  it 'maps nothing but the locales — no name, branding, timezone or email' do
    settings = patch_for(
      'name' => '{"fr":"Ville Acme"}', 'default_locale' => 'fr', 'available_locales' => '["fr"]',
      'time_zone' => 'Europe/Paris', 'official_url' => 'https://acme.example', 'logo' => 'http://x/logo.png',
      'smtp_settings' => '{"from_email":"hello@acme.example"}'
    )['settings']

    expect(settings['core'].keys).to contain_exactly('locales')
    expect(settings).not_to have_key('remote_logo_url')
    expect(settings.keys).to contain_exactly('core', 'project_static_pages', 'parallel_participation')
  end

  it 'always allows and enables the features the import relies on' do
    # Project-level static pages and the parallel-participation back office both need their flags on for
    # the imported projects/pages to be usable.
    settings = patch_for('default_locale' => 'fr', 'available_locales' => '["fr"]')['settings']
    expect(settings['project_static_pages']).to eq('allowed' => true, 'enabled' => true)
    expect(settings['parallel_participation']).to eq('allowed' => true, 'enabled' => true)
  end

  it 'still turns on those features when there is no organization row (no locales, just the flags)' do
    expect(patch_for(nil)).to eq('settings' => flags)
  end

  context 'with the real Decidim export fixture' do
    let(:patch) do
      row = DecidimImporter::CsvReader.read(
        File.join(DecidimImporter::DecidimExportFixture.csv_root, '01--organization.csv')
      ).first
      patch_for(row)
    end

    it 'maps the real organization locales, and nothing else, onto core settings' do
      expect(patch['settings']['core']).to eq('locales' => %w[fr-FR en])
      expect(patch['settings']).to include('project_static_pages', 'parallel_participation')
    end
  end
end
