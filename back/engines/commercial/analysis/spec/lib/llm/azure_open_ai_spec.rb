# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::LLM::AzureOpenAI do
  before { allow(ErrorReporter).to receive(:report_msg) }

  let(:subclass) do
    Class.new(described_class) do
      def self.gpt_model
        'gpt-vocal'
      end
    end
  end
  let(:service) { subclass.new }

  describe 'chat' do
    before { allow(service).to receive(:sleep) } # Don't sleep while testing

    # A simplified version of a successful response from Azure OpenAI Responses API.
    # A better approach would be to use VCR to record and replay actual API responses.
    let(:simplified_response) do
      {
        'id' => 'resp_0f89cbd1c06a0ef90168e3eccd09988197929b3f176d8fd7a6',
        'status' => 'completed',
        'output' => [{
          'id' => 'msg_0f89cbd1c06a0ef90168e3eccd72f8819796810f939adc81ef',
          'type' => 'message',
          'status' => 'completed',
          'content' => [{ 'type' => 'output_text', 'text' => 'The weather today is...' }],
          'role' => 'assistant'
        }]
      }
    end

    context 'when the OpenAI API returns "Too Many Requests" errors' do
      let(:too_many_requests_error) { Faraday::TooManyRequestsError.new(status: 429) }

      it "doesn't retry when retries is set to 0" do
        expect(service.response_client)
          .to receive(:create).once.and_raise(too_many_requests_error)

        expect(ErrorReporter).to receive(:report_msg).once

        expect { service.chat('Hello, how are you?', retries: 0) }
          .to raise_error(Analysis::LLM::TooManyRequestsError)
      end

      it 'retries the specified number of times before raising the error' do
        max_retries = 2

        expect(service.response_client)
          .to receive(:create).exactly(max_retries + 1).times
          .and_raise(too_many_requests_error)

        expect(ErrorReporter).to receive(:report_msg).once

        expect { service.chat('Hello, how are you?', retries: max_retries) }
          .to raise_error(Analysis::LLM::TooManyRequestsError)
      end

      it 'retries MAX_RETRIES times by default' do
        expect(service.response_client)
          .to receive(:create).exactly(described_class::MAX_RETRIES + 1).times
          .and_raise(too_many_requests_error)

        expect(ErrorReporter).to receive(:report_msg).once

        expect { service.chat('Hello, how are you?') }
          .to raise_error(Analysis::LLM::TooManyRequestsError)
      end

      it 'succeeds if a retry succeeds within the allowed attempts' do
        call_count = 0
        success_on_attempt = 3

        allow(service.response_client).to receive(:create) do
          call_count += 1
          call_count < success_on_attempt ? (raise too_many_requests_error) : simplified_response
        end

        expect(service.chat('Hello?', retries: 5)).to eq('The weather today is...')
        expect(service.response_client).to have_received(:create).exactly(success_on_attempt).times
        expect(ErrorReporter).not_to have_received :report_msg
      end
    end

    it 'returns the response text when the API call is successful' do
      allow(service.response_client)
        .to receive(:create).once.and_return(simplified_response)

      expect(service.chat('Hello?')).to eq('The weather today is...')
      expect(ErrorReporter).not_to have_received :report_msg
    end

    it 'supports multiple messages' do
      expect(service.response_client).to receive(:create).with(parameters: hash_including(
        input: [
          { role: 'system', content: [{ type: 'input_text', text: 'Hello, how are you?' }] },
          { role: 'user', content: [{ type: 'input_text', text: "What's the weather like today?" }] }
        ]
      )).and_return(nil)

      messages = [
        Analysis::LLM::Message.new('Hello, how are you?', role: 'system'),
        "What's the weather like today?"
      ]

      service.chat(messages)
    end

    it 'supports single message with multiple inputs' do
      expect(service.response_client)
        .to receive(:create).with(parameters: hash_including(
          input: [{ role: 'user', content: [
            { type: 'input_text', text: 'Hello, how are you?' },
            { type: 'input_text', text: "What's the weather like today?" }
          ] }]
        )).and_return(nil)

      messages = Analysis::LLM::Message.new(
        'Hello, how are you?',
        "What's the weather like today?"
      )

      service.chat(messages)
    end

    it 'supports image inputs' do
      file = create(:global_file, name: 'header.jpg')
      message = Analysis::LLM::Message.new('Describe the content of this image?', file)

      expect(service.response_client)
        .to receive(:create).with(parameters: hash_including(input: [{
          role: 'user', content: [
            { type: 'input_text', text: 'Describe the content of this image?' },
            { type: 'input_image', image_url: start_with('data:image/jpeg;base64,') }
          ]
        }])).and_return(nil)

      service.chat(message)
    end

    it 'raises an error for unsupported image types' do
      file = build(:global_file, name: 'image.heic', mime_type: 'image/heic')
      message = Analysis::LLM::Message.new('Describe the content of this image?', file)

      expect { service.chat(message) }
        .to raise_error(Analysis::LLM::UnsupportedAttachmentError, 'image/heic')
    end

    it 'supports file inputs' do
      file = create(:global_file)
      message = Analysis::LLM::Message.new('Describe the content of this file?', file)

      expect(service.response_client)
        .to receive(:create).with(parameters: hash_including(input: [{
          role: 'user', content: [
            { type: 'input_text', text: 'Describe the content of this file?' },
            { type: 'input_file', filename: file.name, file_data: start_with('data:application/pdf;base64,') }
          ]
        }])).and_return(nil)

      service.chat(message)
    end

    context 'file support' do
      it 'uses PDF preview for non-PDF files' do
        file = create(:global_file, name: 'david.docx')
        create(:file_preview, file: file, status: 'completed')
        message = Analysis::LLM::Message.new('Summarize this document', file)

        expect(service.response_client)
          .to receive(:create).with(parameters: hash_including(input: [{
            role: 'user', content: [
              { type: 'input_text', text: 'Summarize this document' },
              { type: 'input_file', filename: 'david.docx', file_data: start_with('data:application/pdf;base64,') }
            ]
          }])).and_return(nil)

        service.chat(message)
      end

      it 'raises PreviewPendingError when preview is pending' do
        file = create(:global_file, name: 'david.docx')
        message = Analysis::LLM::Message.new('Summarize', file)

        expect { service.chat(message) }
          .to raise_error(Analysis::LLM::PreviewPendingError)
      end

      it 'raises UnsupportedAttachmentError when preview generation failed' do
        file = build(:global_file, name: 'data.xlsx', mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        file.build_preview(status: 'failed', content: nil)
        message = Analysis::LLM::Message.new('Summarize', file)

        expect { service.chat(message) }
          .to raise_error(Analysis::LLM::UnsupportedAttachmentError, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      end
    end
  end

  describe 'usable_context_window' do
    it 'applies headroom ratio to the context window for safety margin' do
      raw_context_window = 1000
      stubbed_headroom_ratio = 0.5 # 50% safety margin
      expected_usable_window = 500

      expect(service)
        .to receive(:context_window)
        .and_return(raw_context_window)

      expect(subclass)
        .to receive(:headroom_ratio)
        .and_return(stubbed_headroom_ratio)

      expect(service.usable_context_window).to eq(expected_usable_window)
    end
  end
end
