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
    it 'validates uniqueness of file_id scoped to attachable_type and attachable_id' do
      attachment = create(:file_attachment)
      new_attachment = build(:file_attachment, file: attachment.file, attachable: attachment.attachable)
      expect(new_attachment).not_to be_valid
    end

    it { is_expected.to validate_inclusion_of(:attachable_type).in_array(described_class::ATTACHABLE_TYPES) }

    describe '#validate_file_belongs_to_project' do
      it 'is invalid when the file and resource belong to different projects' do
        project = create(:project)
        file = create(:file)

        attachables = [
          project,
          create(:event, project: project),
          create(:idea, project: project),
          create(:phase, project: project)
        ]

        attachables.each do |attachable|
          attachment = build(:file_attachment, attachable: attachable, file: file)
          expect(attachment).not_to be_valid
        end
      end

      it 'is valid when the file and resource belong to the same project' do
        project = create(:project)
        file = create(:file, projects: [project])

        attachables = [
          project,
          create(:event, project: project),
          create(:idea, project: project),
          create(:phase, project: project)
        ]

        attachables.each do |attachable|
          attachment = build(:file_attachment, attachable: attachable, file: file)
          expect(attachment).to be_valid
        end
      end
    end
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
