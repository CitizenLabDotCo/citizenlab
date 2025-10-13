# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'File Transcripts' do
  explanation 'Transcripts are automatically generated for uploaded audio/video files using AssemblyAI'

  header 'Content-Type', 'application/json'

  get 'web_api/v1/files/:id/transcript' do
    context 'for an audio file with completed transcript' do
      before do
        admin_header_token
        @file = create(:file)
        # If we'd set ai_processing_allowed to true in the factory, the uploader
        # runs the description job which fails. Be updating it here instead, we
        # avoid the execution of the uploader callbacks in tests.
        @file.update(ai_processing_allowed: true)
        @transcript = create(:file_transcript, :completed, file: @file)
      end

      parameter :id, 'File UUID', required: true

      example 'Get completed transcript' do
        do_request(id: @file.id)

        expect(status).to eq 200

        expect(response_data[:id]).to eq @transcript.id
        expect(response_data.dig(:attributes, :status)).to eq 'completed'
        expect(response_data.dig(:attributes, :assemblyai_transcript)).to be_present
        expect(response_data.dig(:relationships, :file, :data, :id)).to eq @file.id
      end
    end

    context 'for an audio file with processing transcript' do
      before do
        admin_header_token
        @file = create(:file)
        @file.update(ai_processing_allowed: true)
        @transcript = create(:file_transcript, :processing, file: @file)
      end

      example 'Get processing transcript' do
        do_request(id: @file.id)

        expect(status).to eq 200

        expect(response_data[:id]).to eq @transcript.id
        expect(response_data.dig(:attributes, :status)).to eq 'processing'
        expect(response_data.dig(:attributes, :assemblyai_transcript)).to be_nil
      end
    end

    context 'for an audio file with failed transcript' do
      before do
        admin_header_token
        @file = create(:file)
        @file.update(ai_processing_allowed: true)
        @transcript = create(:file_transcript, :failed, file: @file)
      end

      parameter :file_id, 'File UUID', required: true

      example 'Get failed transcript' do
        do_request(id: @file.id)

        expect(status).to eq 200

        expect(response_data[:id]).to eq @transcript.id
        expect(response_data.dig(:attributes, :status)).to eq 'failed'
        expect(response_data.dig(:attributes, :error_message)).to be_present
        expect(response_data.dig(:attributes, :assemblyai_transcript)).to be_nil
      end
    end

    context 'for a file without transcript' do
      before do
        admin_header_token
        @file = create(:file, ai_processing_allowed: false)
      end

      example 'Get 404 when no transcript exists' do
        do_request(id: @file.id)
        expect(status).to eq 404
      end
    end

    context 'authorization' do
      before do
        header_token_for create(:user)
        @other_user = create(:user)
        @file = create(:file, uploader: @other_user)
        @file.update(ai_processing_allowed: true)
        @transcript = create(:file_transcript, :completed, file: @file)
      end

      example 'Get 401 when user cannot access file' do
        do_request(id: @file.id)
        expect(status).to eq 401
      end
    end

    context 'for non-existent file' do
      before { admin_header_token }

      example 'Get 404 for non-existent file' do
        do_request(id: SecureRandom.uuid)
        expect(status).to eq 404
      end
    end
  end
end
