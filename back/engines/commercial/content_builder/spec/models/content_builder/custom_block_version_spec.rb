# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::CustomBlockVersion do
  describe 'completeness' do
    it 'requires the source and the compiled bundle' do
      version = build(:custom_block_version, source: '', bundle: '')

      expect(version).to be_invalid
      expect(version.errors.details[:source]).to include(hash_including(error: :blank))
      expect(version.errors.details[:bundle]).to include(hash_including(error: :blank))
    end

    it 'defaults sdk_version to v1' do
      custom_block = create(:custom_block)
      version = described_class.create!(
        custom_block: custom_block, source: 'x', bundle: 'y', manifest: {}, messages: {}
      )

      expect(version.sdk_version).to eq 'v1'
    end
  end

  describe 'immutability' do
    it 'refuses to be updated once written' do
      version = create(:custom_block_version)

      expect { version.update!(bundle: 'something else') }
        .to raise_error ActiveRecord::ReadOnlyRecord
    end
  end

  describe 'manifest' do
    it 'rejects a config_schema that is not a JSON Schema object' do
      version = build(:custom_block_version, manifest: { 'config_schema' => [] })

      expect(version).to be_invalid
      expect(version.errors.details[:manifest]).to include(hash_including(error: :config_schema_invalid))
    end

    it 'rejects config_schema properties that are not an object' do
      version = build(:custom_block_version, manifest: {
        'config_schema' => { 'type' => 'object', 'properties' => [] }
      })

      expect(version).to be_invalid
      expect(version.errors.details[:manifest]).to include(hash_including(error: :config_schema_invalid))
    end

    it 'accepts a manifest with no config_schema' do
      expect(build(:custom_block_version, manifest: { 'targets' => ['report'] })).to be_valid
    end

    it 'rejects queries that are not SQL strings' do
      version = build(:custom_block_version, manifest: { 'queries' => [{ 'sql' => 'SELECT 1' }] })

      expect(version).to be_invalid
      expect(version.errors.details[:manifest]).to include(hash_including(error: :queries_invalid))
    end
  end

  describe '#queries' do
    it 'reads the queries the build extracted from the source' do
      version = create(:custom_block_version)

      expect(version.queries).to eq ['SELECT count(*) AS contributions FROM reporting_contributions']
    end

    it 'is empty when the manifest names none' do
      expect(build(:custom_block_version, manifest: {}).queries).to eq []
    end
  end

  describe 'number' do
    it 'increments per custom block' do
      custom_block = create(:custom_block)
      other_block = create(:custom_block)

      first = create(:custom_block_version, custom_block: custom_block)
      second = create(:custom_block_version, custom_block: custom_block)

      expect([first.number, second.number]).to eq [1, 2]
      expect(create(:custom_block_version, custom_block: other_block).number).to eq 1
    end

    it 'keeps an explicitly given number' do
      custom_block = create(:custom_block)

      expect(create(:custom_block_version, custom_block: custom_block, number: 7).number).to eq 7
    end
  end
end
