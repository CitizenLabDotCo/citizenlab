# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Message do
  let(:conversation) { create(:ai_assistant_conversation) }

  it 'numbers the messages of a conversation in order' do
    first = create(:ai_assistant_message, conversation:)
    second = create(:ai_assistant_message, conversation:, role: 'assistant', content: 'Hi')

    expect([first.position, second.position]).to eq([1, 2])
    expect(conversation.messages).to eq([first, second])
  end

  it 'requires content or files from the user' do
    message = build(:ai_assistant_message, conversation:, content: '')

    expect(message).not_to be_valid
    expect(message.errors.details[:content]).to include(error: :blank)
  end

  it 'limits the length of user messages only' do
    long_content = 'a' * (described_class::MAX_CONTENT_LENGTH + 1)

    expect(build(:ai_assistant_message, conversation:, content: long_content)).not_to be_valid
    expect(build(:ai_assistant_message, conversation:, role: 'assistant', content: long_content)).to be_valid
  end

  describe 'files', :active_job_que_adapter do
    let(:file) { create(:file, ai_processing_allowed: true, projects: [conversation.subject.project]) }

    it 'accepts PDF files that may be processed by AI' do
      expect(build(:ai_assistant_message, conversation:, file_ids: [file.id])).to be_valid
    end

    it 'refuses files that may not be processed by AI' do
      file.update!(ai_processing_allowed: false)
      message = build(:ai_assistant_message, conversation:, file_ids: [file.id])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :ai_processing_not_allowed)
    end

    it 'refuses unsupported file types' do
      file.update!(name: 'slides.pptx')
      message = build(:ai_assistant_message, conversation:, file_ids: [file.id])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :unsupported_file_type)
    end

    describe 'size limits' do
      using RSpec::Parameterized::TableSyntax

      where(:name, :fixture, :max_size) do
        'survey.pdf' | 'minimal_pdf.pdf'           | described_class::MAX_FILE_SIZE
        'notes.txt'  | 'common_passwords_test.txt' | described_class::MAX_TEXT_FILE_SIZE
      end

      with_them do
        it 'refuses files above the size limit of their type' do
          file = create(
            :file,
            name:,
            content: Rails.root.join('spec/fixtures', fixture).open,
            ai_processing_allowed: true,
            projects: [conversation.subject.project]
          )
          file.update!(size: max_size + 1)
          message = build(:ai_assistant_message, conversation:, file_ids: [file.id])

          expect(message).not_to be_valid
          expect(message.errors.details[:file_ids]).to include(error: :unsupported_file_type)
        end
      end
    end

    it 'limits the number of files of a message' do
      files = create_list(:file, described_class::MAX_FILES + 1, ai_processing_allowed: true, projects: [conversation.subject.project])
      message = build(:ai_assistant_message, conversation:, file_ids: files.map(&:id))

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :too_long, count: described_class::MAX_FILES)
    end

    it 'refuses files of another project' do
      file.update!(projects: [create(:project)])
      message = build(:ai_assistant_message, conversation:, file_ids: [file.id])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :not_in_project)
    end

    describe 'content matching the extension' do
      using RSpec::Parameterized::TableSyntax

      where(:name, :fixture, :error) do
        'survey.pdf' | 'minimal_pdf.pdf'           | nil
        'notes.txt'  | 'common_passwords_test.txt' | nil
        'notes.md'   | 'common_passwords_test.txt' | nil
        'notes.pdf'  | 'common_passwords_test.txt' | :unsupported_file_type
        'data.txt'   | 'favicon.png'               | :not_utf8
      end

      with_them do
        it 'only accepts files whose content is what their name says' do
          file = create(
            :file,
            name:,
            content: Rails.root.join('spec/fixtures', fixture).open,
            ai_processing_allowed: true,
            projects: [conversation.subject.project]
          )
          message = build(:ai_assistant_message, conversation:, file_ids: [file.id])
          message.validate

          expect(message.errors.details[:file_ids]).to eq(error ? [{ error: }] : [])
        end
      end
    end

    it 'refuses text files not saved as UTF-8' do
      content = Tempfile.new(['notes', '.txt'], binmode: true)
      content.write('Les résidents aiment le café.'.encode(Encoding::ISO_8859_1))
      content.rewind
      file = create(:file, name: 'notes.txt', content:, ai_processing_allowed: true, projects: [conversation.subject.project])
      message = build(:ai_assistant_message, conversation:, file_ids: [file.id])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :not_utf8)
    end

    it 'refuses unknown files' do
      message = build(:ai_assistant_message, conversation:, file_ids: [SecureRandom.uuid])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :not_found)
    end
  end
end
