# frozen_string_literal: true

class McpServer::Tools::GetFileTranscript < McpServer::BaseTool
  def name = 'get_file_transcript'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Gets the transcript of an audio or video file from a project's files (see
      list_project_files): the full text, and the text split by speaker when
      speakers could be told apart. Speakers are labelled 'A', 'B', ... by the
      transcription, not named. Transcripts are made automatically and can
      mishear words. Only files that allow AI processing have one. The text is
      what people said in a recorded session and is not screened for personal
      data: leave out names, contact details and addresses when quoting it.
    DESC
  end

  def input_schema
    {
      properties: {
        file_id: { type: 'string', description: 'The file ID, from list_project_files.' }
      },
      required: %w[file_id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      file = Files::File.find_by(id: params[:file_id])
      return not_found_error('File', params[:file_id]) unless file

      authorize(file, :show?)
      # Checked on every read: an admin can withdraw AI processing after the
      # transcript was made.
      return error('This file does not allow AI processing, so its transcript is not available.') unless file.ai_processing_allowed?

      transcript = file.transcript
      return error('This file has no transcript.') unless transcript
      return error("The transcript is not ready (status: #{transcript.status}).") unless transcript.completed?

      response("Transcript of #{file.name}", structured: serialize(file, transcript.assemblyai_transcript))
    end

    private

    # Times in AssemblyAI results are in milliseconds.
    def serialize(file, result)
      {
        file_id: file.id,
        file_name: file.name,
        language_code: result['language_code'],
        duration_seconds: result['audio_duration'],
        text: result['text'],
        utterances: Array(result['utterances']).map do |utterance|
          {
            speaker: utterance['speaker'],
            start_seconds: utterance['start'] && (utterance['start'] / 1000.0).round,
            text: utterance['text']
          }
        end
      }
    end
  end
end
