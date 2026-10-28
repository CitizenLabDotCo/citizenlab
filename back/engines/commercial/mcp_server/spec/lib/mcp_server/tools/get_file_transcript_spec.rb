# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::GetFileTranscript do
  let(:current_user) { create(:admin) }
  # Allowed after create: creating a file that allows AI processing enqueues a
  # description job, which fails in tests.
  let(:file) do
    create(:file, name: 'town-hall.mp3', projects: [create(:project)]).tap do |file|
      file.update!(ai_processing_allowed: true)
    end
  end

  def get(file_id)
    run_mcp_tool(described_class, params: { file_id: }, current_user:)
  end

  def completed_transcript(assemblyai_transcript)
    create(:file_transcript, :completed, file: file, assemblyai_transcript: { 'id' => 'a1', 'status' => 'completed', **assemblyai_transcript })
  end

  it 'returns the text split by speaker, once, without word-level detail' do
    completed_transcript(
      'text' => 'We need more benches. I agree.',
      'language_code' => 'en',
      'audio_duration' => 95,
      'words' => [{ 'text' => 'We', 'start' => 0, 'end' => 200, 'confidence' => 0.99 }],
      'utterances' => [
        { 'speaker' => 'A', 'start' => 0, 'end' => 1500, 'text' => 'We need more benches.', 'confidence' => 0.9 },
        { 'speaker' => 'B', 'start' => 61_400, 'end' => 62_000, 'text' => 'I agree.', 'confidence' => 0.9 }
      ]
    )

    response = get(file.id)

    expect(response).not_to be_error
    expect(response.structured_content).to eq(
      file_id: file.id,
      file_name: 'town-hall.mp3',
      language_code: 'en',
      duration_seconds: 95,
      text: nil,
      utterances: [
        { speaker: 'A', start_seconds: 0, text: 'We need more benches.' },
        { speaker: 'B', start_seconds: 61, text: 'I agree.' }
      ]
    )
  end

  it 'returns the full text when speakers were not told apart' do
    completed_transcript('text' => 'Hello.')

    expect(get(file.id).structured_content).to include(text: 'Hello.', utterances: [])
  end

  it 'refuses when the file no longer allows AI processing' do
    completed_transcript('text' => 'Hello.')
    file.update!(ai_processing_allowed: false)

    response = get(file.id)

    expect(response).to be_error
    expect(response.content.first[:text]).not_to include('Hello')
  end

  it 'reports a transcript that is not ready yet' do
    create(:file_transcript, :processing, file: file)

    expect(get(file.id)).to be_error
  end

  it 'reports a file without a transcript' do
    expect(get(file.id)).to be_error
  end

  it 'returns a not-found error when the file is missing' do
    expect(get(SecureRandom.uuid)).to be_not_found('File')
  end

  context 'when the user cannot see the file' do
    let(:current_user) { create(:project_moderator) }

    it 'refuses' do
      completed_transcript('text' => 'Hello.')

      response = get(file.id)

      expect(response).to be_error
      expect(response.content.first[:text]).to start_with('Not allowed')
    end
  end
end
