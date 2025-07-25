# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::FileAttachment do
  subject(:attachment) { build(:file_attachment) }

  it { is_expected.to be_valid }

  describe 'associations' do
    it { is_expected.to belong_to(:file).class_name('Files::File').inverse_of(:attachments) }
    it { is_expected.to belong_to(:attachable) }
  end

  describe 'validations' do
    it { is_expected.to validate_uniqueness_of(:file_id).scoped_to(%w[attachable_type attachable_id]).case_insensitive }
    it { is_expected.to validate_inclusion_of(:attachable_type).in_array(described_class::ATTACHABLE_TYPES) }
  end

  describe 'ATTACHABLE_TYPES' do
    it 'ensures all types include Files::FileAttachable concern' do
      described_class::ATTACHABLE_TYPES.each do |type|
        model_class = type.constantize

        expect(model_class.included_modules).to include(Files::FileAttachable),
          "#{type} should include Files::FileAttachable concern"
      end
    end
  end
end
