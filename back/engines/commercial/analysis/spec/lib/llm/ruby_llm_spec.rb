# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::LLM::RubyLLM do
  let(:subclass) do
    Class.new(described_class) do
      def model
        'gpt-vocal'
      end
    end
  end
  let(:service) { subclass.new }
  let(:chat) { instance_double(RubyLLM::Chat) }

  before do
    allow(RubyLLM).to receive(:chat).with(model: 'gpt-vocal').and_return(chat)
    allow(chat).to receive(:ask).and_return(instance_double(RubyLLM::Message, content: 'answer'))
  end

  describe 'chat' do
    context 'text files' do
      it 'passes a markdown file as text instead of as a file path' do
        file = create(:global_file, name: 'notes.md')
        message = Analysis::LLM::Message.new('Summarize this transcript', file)

        expect(chat).to receive(:ask).with(
          a_string_including('Summarize this transcript')
            .and(a_string_including('File: notes.md'))
            .and(a_string_including('Bike lanes incomplete'))
        )

        service.chat(message)
      end

      it 'does not raise on bytes that are not valid UTF-8' do
        file = create(:global_file, name: 'notes_latin1.md')
        message = Analysis::LLM::Message.new('Summarize this transcript', file)

        expect { service.chat(message) }.not_to raise_error
      end
    end

    context 'non-text files' do
      it 'passes a tempfile path for a PDF' do
        file = create(:global_file)
        message = Analysis::LLM::Message.new('Summarize this document', file)

        expect(chat).to receive(:ask).with('Summarize this document', with: [a_string_ending_with('.pdf')])

        service.chat(message)
      end

      it 'raises UnsupportedAttachmentError when no preview exists' do
        file = build(:global_file, name: 'data.xlsx', mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        message = Analysis::LLM::Message.new('Summarize', file)

        expect { service.chat(message) }
          .to raise_error(Analysis::LLM::UnsupportedAttachmentError, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      end
    end
  end
end
