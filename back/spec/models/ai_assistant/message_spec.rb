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

  # The context an app writes around what a person typed carries the whole subject,
  # and nobody typed it.
  it 'limits the length of what a person typed, not of the context written around it' do
    too_long = 'a' * (described_class::MAX_CONTENT_LENGTH + 1)

    expect(build(:ai_assistant_message, conversation:, content: too_long)).to be_invalid
    expect(build(:ai_assistant_message, conversation:, content: nil, model_text: too_long)).to be_valid
  end

  describe '#for_model' do
    it 'is the context written for it' do
      message = build(:ai_assistant_message, conversation:, content: 'Shorter.', model_text: 'Shorter. The report reads:')

      expect(message.for_model).to eq 'Shorter. The report reads:'
    end

    # Most messages are written once and read by both.
    it 'falls back to what the chat shows' do
      expect(build(:ai_assistant_message, conversation:, content: 'Shorter.').for_model).to eq 'Shorter.'
    end
  end

  # The chat shows a message it has text for; a step of a run it has none for.
  it 'is listed as displayed only when it has something to show' do
    shown = create(:ai_assistant_message, conversation:, content: 'Shorter.')
    create(:ai_assistant_message, conversation:, content: nil, model_text: 'The report reads:')

    expect(conversation.messages.displayed).to eq [shown]
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

    it 'limits the number of files of a conversation' do
      files = create_list(:file, 6, ai_processing_allowed: true, projects: [conversation.subject.project])
      create(:ai_assistant_message, conversation:, file_ids: files[0..2].map(&:id))
      create(:ai_assistant_message, conversation:, file_ids: files[3..4].map(&:id))
      message = build(:ai_assistant_message, conversation:, file_ids: [files[5].id])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :too_many_in_conversation)
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
