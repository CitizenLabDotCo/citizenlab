# frozen_string_literal: true

require 'rails_helper'

RSpec.describe File do
  subject(:file) { build(:file) }

  it { is_expected.to be_valid }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:content) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:uploader).class_name('User').optional }
  end

  context 'when the uploader is deleted' do
    let!(:file) { create(:file) }

    it 'does not delete the file' do
      expect { file.uploader.destroy! }.not_to change(Files::File, :count)
      expect(file.reload.uploader).to be_nil
    end
  end
end
