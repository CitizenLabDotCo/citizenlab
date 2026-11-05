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

    context 'when a file is already attached to an idea' do
      it 'is invalid to attach the same file to another resource' do
        attachment = create(:file_attachment, to: :idea)
        file = attachment.file

        attachment2 = build(:file_attachment, file: file, to: :idea)
        expect(attachment2).not_to be_valid
        expect(attachment2.errors[:file]).to include(
          'cannot be attached to other resources because it is already attached to an idea'
        )

        attachment3 = build(:file_attachment, file: file, to: :project)
        expect(attachment3).not_to be_valid
        expect(attachment3.errors[:file]).to include(
          'cannot be attached to other resources because it is already attached to an idea'
        )
      end
    end

    context 'when a file is attached to a resource' do
      it 'is invalid to attach the file to an idea' do
        attachment = create(:file_attachment, to: :project)
        file = attachment.file

        attachment2 = build(:file_attachment, file: file, to: :idea)
        expect(attachment2).not_to be_valid
        expect(attachment2.errors[:file]).to include(
          'cannot be attached to an idea because it is already attached to another resource'
        )
      end
    end

    it 'is valid to attach a file to multiple non-idea resources' do
      attachment1 = create(:file_attachment, to: :event)
      file = attachment1.file

      attachment2 = build(:file_attachment, file: file, to: :project)
      expect(attachment2).to be_valid
    end

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
        project = create(:single_phase_ideation_project)
        file = create(:file, projects: [project])

        attachables = [
          project,
          create(:event, project: project),
          create(:idea, project: project),
          create(:phase, project: project),
          create(:analysis, project: project)
        ]

        attachables.each do |attachable|
          attachment = build(:file_attachment, attachable: attachable, file: file)
          expect(attachment).to be_valid
        end
      end
    end
  end

  context 'when attaching a file to an Idea' do
    it 'destroys the associated file when the attachment is destroyed' do
      attachment = create(:file_attachment, to: :idea)
      file = attachment.file

      attachment.destroy!

      expect { file.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  context 'when attaching a file to a non-Idea resource' do
    it 'does not destroy the associated file when the attachment is destroyed' do
      attachment = create(:file_attachment, to: :project)
      file = attachment.file

      attachment.destroy!

      expect { file.reload }.not_to raise_error
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
