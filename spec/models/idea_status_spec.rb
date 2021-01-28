# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable Metrics/BlockLength
RSpec.describe IdeaStatus, type: :model do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:idea_status)).to be_valid
    end
  end

  subject { create(:idea_status) }

  let(:code) { IdeaStatus::MINIMUM_REQUIRED_CODES.sample }

  context 'when its code is required' do
    subject { create(:idea_status, code: code) }

    describe 'if it is the only existing with this code' do
      it 'cannot be destroyed' do
        subject.destroy
        expect(subject.destroyed?).to eq false
      end

      it 'it\'s code cannot be updated' do
        subject.update(code: :custom)
        expect(subject.errors[:code]).not_to be_empty
      end
    end

    describe 'if others exist with this code' do
      before do
        create_list(:idea_status, 3, code: code)
      end

      it 'can be destroyed' do
        subject.destroy
        expect(subject.destroyed?).to eq true
      end

      it 'it\'s code can be updated' do
        subject.update(code: :custom)
        expect(subject.errors[:code]).to be_empty
      end
    end
  end

  context 'when its code is not required' do
    before do
      subject.code = 'accepted'
    end

    it 'can be destroyed' do
      subject.destroy
      expect(subject.destroyed?).to eq true
    end
  end
end
# rubocop:enable Metrics/BlockLength
