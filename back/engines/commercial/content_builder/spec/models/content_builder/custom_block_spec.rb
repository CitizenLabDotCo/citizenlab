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
        create(:custom_block_version, custom_block: custom_block)
        custom_block.status = status

        expect(custom_block).to be_valid
      end
    end
  end

  describe 'publishing' do
    it 'is invalid when published without a version to render' do
      custom_block = create(:custom_block)
      custom_block.status = 'published'

      expect(custom_block).to be_invalid
      expect(custom_block.errors.details[:base]).to include(hash_including(error: :no_version))
    end

    it 'is valid when published with a version' do
      custom_block = create(:custom_block)
      create(:custom_block_version, custom_block: custom_block)

      expect(custom_block.update(status: 'published')).to be true
      expect(custom_block.reload).to be_published
    end
  end

  describe '#latest_version' do
    it 'is the highest-numbered version' do
      custom_block = create(:custom_block)
      create(:custom_block_version, custom_block: custom_block)
      newest = create(:custom_block_version, custom_block: custom_block)

      expect(custom_block.latest_version).to eq newest
    end

    it 'is nil for a block with no versions' do
      expect(create(:custom_block).latest_version).to be_nil
    end
  end

  describe 'destroying' do
    it 'destroys the versions of the block' do
      custom_block = create(:custom_block, :published)

      expect { custom_block.destroy! }
        .to change(ContentBuilder::CustomBlockVersion, :count).by(-1)
    end
  end
end
