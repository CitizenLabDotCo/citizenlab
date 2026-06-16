# frozen_string_literal: true

require 'rails_helper'
require_relative '../../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::Extractors::UsersExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }

  def extract(rows, extra_text_field_keys: [])
    described_class.new(
      rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR',
      extra_text_field_keys: extra_text_field_keys
    ).run
  end

  def row(overrides = {})
    {
      'uid' => 'decidim-user-1', 'name' => 'Marie Curie', 'email' => 'marie@example.fr',
      'confirmed_at' => '2020-01-01', 'locale' => 'fr', 'about' => 'Chercheuse',
      'personal_url' => 'https://marie.example.fr', 'admin' => 'true',
      'extended_data' => '{"gender":"female","phone_number":"+33123","date_of_birth":"1967-11-07"}'
    }.merge(overrides)
  end

  it 'maps a confirmed user with unique_code from uid, mapped locale, bio and demographics' do
    attrs = extract([row]).first.attributes

    expect(attrs['email']).to eq 'marie@example.fr'
    expect(attrs['locale']).to eq 'fr-FR'
    expect(attrs['unique_code']).to eq 'decidim-user-1'
    expect(attrs['first_name']).to eq 'Marie'
    expect(attrs['last_name']).to eq 'Curie'
    expect(attrs['imported']).to be true
    expect(attrs['roles']).to eq [{ 'type' => 'admin' }]
    expect(attrs['custom_field_values']).to eq({ 'gender' => 'female', 'birthyear' => 1967 })
    expect(attrs['bio_multiloc']['fr-FR']).to include('Chercheuse').and include('https://marie.example.fr')
    expect(attrs['password']).to be_present
  end

  it 'skips deleted, blocked, unconfirmed and email-less accounts' do
    rows = [
      row('uid' => 'decidim-user-3', 'deleted_at' => '2021'),
      row('uid' => 'decidim-user-4', 'blocked' => 'true'),
      row('uid' => 'decidim-user-5', 'confirmed_at' => ''),
      row('uid' => 'decidim-user-6', 'email' => '')
    ]
    expect(extract(rows)).to be_empty
  end

  it 'skips accounts whose email domain is on the Go Vocal blacklist' do
    blacklisted = EmailDomainBlacklist.load.first
    spam = row('uid' => 'decidim-user-8', 'email' => "spammer@#{blacklisted}")
    legit = row('uid' => 'decidim-user-9', 'email' => 'real@example.org')

    records = extract([spam, legit])

    expect(records.map { |r| r.attributes['email'] }).to eq(['real@example.org'])
  end

  it 'registers users under their Decidim uid for later joins' do
    extract([row('uid' => 'decidim-user-7', 'email' => 'jean@y.fr')])
    expect(ref_map.fetch('decidim-user-7').attributes['email']).to eq 'jean@y.fr'
  end

  it 'reads gender and birthyear out of extended_data JSON' do
    attrs = extract([row('extended_data' => '{"gender":"other","date_of_birth":"1990-05-12"}')]).first.attributes
    expect(attrs['custom_field_values']).to eq({ 'gender' => 'unspecified', 'birthyear' => 1990 })
  end

  it 'copies configured extra text fields out of extended_data into custom_field_values' do
    rows = [row('extended_data' => '{"gender":"female","phone_number":"+33123","postal_code":"75001"}')]
    attrs = extract(rows, extra_text_field_keys: %w[phone_number postal_code]).first.attributes
    expect(attrs['custom_field_values']).to eq(
      'gender' => 'female', 'phone_number' => '+33123', 'postal_code' => '75001'
    )
  end

  it 'anonymises names and emails when asked, while still filtering on the real email' do
    blacklisted = EmailDomainBlacklist.load.first
    records = described_class.new(
      [row('email' => 'marie.curie@example.fr'),
        row('uid' => 'decidim-user-2', 'email' => "spam@#{blacklisted}")],
      ref_map, locale_mapper: mapper, primary_locale: 'fr-FR', anonymize_users: true
    ).run

    # The spam account is still skipped based on its real (blacklisted) domain.
    expect(records.size).to eq(1)
    attrs = records.first.attributes
    expect(attrs['email']).to match(/\Auser-[0-9a-f]{12}@example\.org\z/)
    expect(attrs['email']).not_to include('marie.curie')
    expect(attrs['first_name']).to be_present
    expect(attrs['last_name']).to be_present
    expect(attrs['unique_code']).to eq('decidim-user-1') # join key preserved
  end

  it 'derives a unique anonymised email per user (from the uid)' do
    records = described_class.new(
      [row('uid' => 'decidim-user-1'), row('uid' => 'decidim-user-2', 'email' => 'other@example.fr')],
      ref_map, locale_mapper: mapper, primary_locale: 'fr-FR', anonymize_users: true
    ).run
    expect(records.map { |r| r.attributes['email'] }.uniq.size).to eq(2)
  end

  it 'leaves names and emails untouched by default' do
    attrs = extract([row]).first.attributes
    expect(attrs['email']).to eq('marie@example.fr')
    expect(attrs['first_name']).to eq('Marie')
  end

  context 'with the real Decidim export fixture' do
    let(:rows) do
      DecidimImporter::CsvReader.read(
        File.join(DecidimImporter::DecidimExportFixture.csv_root, '02--users.csv')
      )
    end
    let(:records) { extract(rows) }

    it 'imports every confirmed, non-deleted, non-blocked user from the export' do
      expected = rows.count do |r|
        r['confirmed_at'].to_s.strip.present? &&
          r['deleted_at'].to_s.strip.empty? &&
          r['blocked'].to_s.strip.downcase != 'true' &&
          r['email'].to_s.strip.present?
      end
      expect(records.size).to eq(expected)
    end

    it "promotes the export's admin to a Go Vocal admin role" do
      admin_record = records.find { |r| r.attributes['unique_code'] == 'decidim-user-1' }
      expect(admin_record.attributes['roles']).to eq [{ 'type' => 'admin' }]
      expect(admin_record.attributes['custom_field_values']['gender']).to eq 'unspecified'
    end
  end
end
