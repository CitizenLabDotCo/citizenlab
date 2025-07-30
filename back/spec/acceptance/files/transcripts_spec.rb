# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'File Transcripts' do
  explanation 'Transcripts are automatically generated for uploaded audio/video files using AssemblyAI'

  header 'Content-Type', 'application/json'

  get 'web_api/v1/files/:file_id/transcript' do
    context 'for an audio file with completed transcript' do
      before do
        admin_header_token
        @file = create(:file, ai_processing_allowed: true)
        @transcript = create(:file_transcript, :completed, file: @file)
      end

      parameter :file_id, 'File UUID', required: true

      example 'Get completed transcript' do
        do_request(file_id: @file.id)

        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @transcript.id
        expect(json_response.dig(:data, :attributes, :status)).to eq 'completed'
        expect(json_response.dig(:data, :attributes, :text)).to be_present
        expect(json_response.dig(:data, :attributes, :confidence)).to be_present
        expect(json_response.dig(:data, :attributes, :words)).to be_present
        expect(json_response.dig(:data, :attributes, :utterances)).to be_present
        expect(json_response.dig(:data, :relationships, :file, :data, :id)).to eq @file.id
      end
    end

    context 'for an audio file with processing transcript' do
      before do
        admin_header_token
        @file = create(:file, ai_processing_allowed: true)
        @transcript = create(:file_transcript, :processing, file: @file)
      end

      parameter :file_id, 'File UUID', required: true

      example 'Get processing transcript' do
        do_request(file_id: @file.id)

        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @transcript.id
        expect(json_response.dig(:data, :attributes, :status)).to eq 'processing'
        expect(json_response.dig(:data, :attributes, :text)).to be_nil
        expect(json_response.dig(:data, :attributes, :confidence)).to be_nil
        expect(json_response.dig(:data, :attributes, :assemblyai_id)).to be_present
      end
    end

    context 'for an audio file with failed transcript' do
      before do
        admin_header_token
        @file = create(:file, ai_processing_allowed: true)
        @transcript = create(:file_transcript, :failed, file: @file)
      end

      parameter :file_id, 'File UUID', required: true

      example 'Get failed transcript' do
        do_request(file_id: @file.id)

        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @transcript.id
        expect(json_response.dig(:data, :attributes, :status)).to eq 'failed'
        expect(json_response.dig(:data, :attributes, :error_message)).to be_present
        expect(json_response.dig(:data, :attributes, :text)).to be_nil
      end
    end

    context 'for a file without transcript' do
      before do
        admin_header_token
        @file = create(:file, ai_processing_allowed: false)
      end

      parameter :file_id, 'File UUID', required: true

      example 'Get 404 when no transcript exists' do
        do_request(file_id: @file.id)
        expect(status).to eq 404
      end
    end

    context 'authorization' do
      before do
        user_header_token
        @other_user = create(:user)
        @file = create(:file, uploader: @other_user, ai_processing_allowed: true)
        @transcript = create(:file_transcript, :completed, file: @file)
      end

      parameter :file_id, 'File UUID', required: true

      example 'Get 404 when user cannot access file' do
        do_request(file_id: @file.id)
        expect(status).to eq 404
      end
    end

    context 'for non-existent file' do
      before { admin_header_token }

      parameter :file_id, 'File UUID', required: true

      example 'Get 404 for non-existent file' do
        do_request(file_id: SecureRandom.uuid)
        expect(status).to eq 404
      end
    end
  end

  context 'file serializer includes transcript' do
    before do
      admin_header_token
      @file = create(:file, ai_processing_allowed: true)
      @transcript = create(:file_transcript, :completed, file: @file)
    end

    get 'web_api/v1/files/:id' do
      parameter :id, 'File UUID', required: true

      example 'File includes transcript relationship' do
        do_request(id: @file.id)

        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :transcript, :data, :id)).to eq @transcript.id

        # Check included transcript data
        transcript_included = json_response[:included]&.find { |i| i[:type] == 'transcript' && i[:id] == @transcript.id }
        expect(transcript_included).to be_present
        expect(transcript_included.dig(:attributes, :status)).to eq 'completed'
        expect(transcript_included.dig(:attributes, :text)).to be_present
      end
    end
  end
end
