# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaStatus do
  subject { create(:idea_status) }

  let(:code) { 'proposed' }

  context 'Default factory' do
    it 'is valid' do
      expect(build(:idea_status)).to be_valid
    end
  end

  it { is_expected.to validate_presence_of(:title_multiloc) }

  context 'when its code is required' do
    subject { create(:idea_status, code: code) }

    describe 'if others exist with this code' do
      before do
        create_list(:idea_status, 3, code: code)
      end

      it 'can be destroyed' do
        subject.destroy
        expect(subject.destroyed?).to be true
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
      expect(subject.destroyed?).to be true
    end
  end
end
