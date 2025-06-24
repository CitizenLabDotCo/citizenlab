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

  describe 'size' do
    context 'when creating a new file' do
      it 'automatically calculates and stores the file size' do
        expect(file.size).to be_nil # Not calculated until save

        file.save!

        expect(file.size).to be_present
        expect(file.size).to eq(file.content.size)
      end
    end

    context 'when updating the file content' do
      let!(:file) { create(:file) }

      it 'recalculates the size' do
        original_size = file.size
        expect(original_size).to be_present

        file.content = Rails.root.join('spec/fixtures/minimal_pdf.pdf').open
        expect { file.save! }.to change(file, :size).from(original_size).to(130)
      end
    end
  end
end
