# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::CustomBlockVersion do
  describe 'compile_state' do
    it 'defaults to pending' do
      custom_block = create(:custom_block)
      version = described_class.create!(custom_block: custom_block, manifest: {}, messages: {})

      expect(version.compile_state).to eq 'pending'
      expect(version).to be_pending
    end

    it 'is invalid for a state outside of COMPILE_STATES' do
      version = build(:custom_block_version, compile_state: 'compiling')

      expect(version).to be_invalid
      expect(version.errors.details[:compile_state]).to include(hash_including(error: :inclusion))
    end

    it 'is valid for every state in COMPILE_STATES' do
      described_class::COMPILE_STATES.each do |compile_state|
        expect(build(:custom_block_version, compile_state: compile_state)).to be_valid
      end
    end

    it 'reports compiled? only once compiled' do
      expect(create(:custom_block_version)).to be_compiled
      expect(create(:custom_block_version, :pending)).not_to be_compiled
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
  end
end
