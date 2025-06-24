# frozen_string_literal: true

require 'rails_helper'

RSpec.describe File do
  subject(:file) { build(:file) }

  it { is_expected.to be_valid }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:content) }
    it { is_expected.to validate_numericality_of(:size).is_greater_than_or_equal_to(0).allow_nil }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:uploader).class_name('User').optional }
  end

  describe 'metadata' do
    context 'when creating a new file' do
      it 'automatically calculates and stores both size and mime_type' do
        expect(file.size).to be_nil # Not calculated until save
        expect(file.mime_type).to be_nil

        file.save!

        expect(file.size).to be_present
        expect(file.size).to eq(130)
        expect(file.mime_type).to eq('application/pdf')
      end
    end

    context 'when updating the file content' do
      let!(:file) { create(:file) }

      it 'recalculates both size and mime_type' do
        file.content = Rails.root.join('spec/fixtures/audio_mp4.mp4').open

        expect { file.save! }
          .to change(file, :size).from(130).to(1_493)
          .and change(file, :mime_type).from('application/pdf').to('video/mp4')
      end
    end
  end
end
