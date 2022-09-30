# frozen_string_literal: true

require 'rails_helper'
require 'query'

RSpec.describe Analytics::MatomoDataImporter do
  subject(:importer) { described_class.new('https://demo.matomo.cloud', 'token')}

  describe '#visits_in_batches' do
    it do
      importer = described_class.new('https://demo.matomo.cloud', 'token')
      importer.send(:visits_in_batches, '1', period: 'yollow', date: 'today', batch_size: 500) do |batch|
        puts batch.size
      end
    end
  end

  describe '#import' do
    it do
      importer = described_class.new('https://demo.matomo.cloud', 'token')
      ts = Time.new(2022, 9, 1, 15).to_i
      puts importer.import('1', ts, min_duration: 3.hours, max_nb_batches: 4, batch_size: 50).inspect
      pending 'not implemented yet'
    end
  end

  describe '#update_referrer_types' do
    it do
      importer.send(:update_referrer_types, [
        { 'referrerType' => 'referrer-type-1', 'referrerTypeName' => 'referrer-name-1' },
        { 'referrerType' => 'referrer-type-2', 'referrerTypeName' => 'referrer-name-2' }
      ])
    end
  end
end
