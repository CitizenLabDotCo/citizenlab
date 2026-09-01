# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::CustomBlock do
  describe 'status' do
    it 'defaults to draft' do
      expect(create(:custom_block).status).to eq 'draft'
    end

    it 'is invalid for a status outside of STATUSES' do
      custom_block = build(:custom_block, status: 'archived')

      expect(custom_block).to be_invalid
      expect(custom_block.errors.details[:status]).to include(hash_including(error: :inclusion))
    end

    it 'is valid for every status in STATUSES' do
      described_class::STATUSES.each do |status|
        custom_block = create(:custom_block)
        custom_block.current_version = create(:custom_block_version, custom_block: custom_block)
        custom_block.status = status

        expect(custom_block).to be_valid
      end
    end
  end

  describe 'publishing' do
    it 'is invalid when published without a current version' do
      custom_block = create(:custom_block)
      custom_block.status = 'published'

      expect(custom_block).to be_invalid
      expect(custom_block.errors.details[:current_version]).to include(hash_including(error: :blank))
    end

    it 'is valid when published with a current version' do
      custom_block = create(:custom_block)
      version = create(:custom_block_version, custom_block: custom_block)

      expect(custom_block.update(current_version: version, status: 'published')).to be true
      expect(custom_block.reload).to be_published
    end
  end

  describe 'version numbering' do
    it 'numbers the versions of a block sequentially' do
      custom_block = create(:custom_block)

      first = create(:custom_block_version, custom_block: custom_block)
      second = create(:custom_block_version, custom_block: custom_block)

      expect(first.number).to eq 1
      expect(second.number).to eq 2
    end

    it 'numbers the versions of every block independently' do
      other_block = create(:custom_block)
      create(:custom_block_version, custom_block: create(:custom_block))

      expect(create(:custom_block_version, custom_block: other_block).number).to eq 1
    end

    it 'keeps an explicitly given number' do
      custom_block = create(:custom_block)

      expect(create(:custom_block_version, custom_block: custom_block, number: 7).number).to eq 7
    end
  end

  describe 'destroying' do
    it 'destroys the versions and the AI sessions of the block' do
      custom_block = create(:custom_block, :published)
      create(:custom_block_ai_session, custom_block: custom_block)

      expect { custom_block.destroy! }
        .to change(ContentBuilder::CustomBlockVersion, :count).by(-1)
        .and change(ContentBuilder::CustomBlockAISession, :count).by(-1)
    end
  end
end
