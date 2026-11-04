# frozen_string_literal: true

class McpServer::Tools::GetFileTranscript < McpServer::BaseTool
  def name = 'get_file_transcript'
  def annotations = READ_ANNOTATIONS

  # About 10k tokens. A two-hour meeting is about 100k characters.
  PAGE_CHARS = 40_000

  def description
    <<~DESC.squish
      Gets the transcript of an audio or video file from a project's files (see
      list_project_files), split by speaker. Speakers are labelled 'A', 'B', ...
      by the transcription, not named; the speaker is null when speakers
      couldn't be told apart. Long transcripts come in pages of about
      #{PAGE_CHARS} characters: check total_pages and ask for the next page.
      A long turn can be split across utterances; start_seconds is null when
      the transcript doesn't say where a split part starts. Transcripts are
      made automatically and can mishear words. Only files that allow AI
      processing have one. The text is what people said in a recorded session
      and is not screened for personal data: leave out names, contact details
      and addresses when quoting it.
    DESC
  end

  def input_schema
    {
      properties: {
        file_id: { type: 'string', description: 'The file ID, from list_project_files.' },
        page: { type: 'integer', description: 'Page number (default: 1)' }
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

      result = transcript.assemblyai_transcript
      pages = paginate(utterances(result))
      page = (params[:page] || 1).to_i
      return error("page must be between 1 and #{pages.size}.") unless page.between?(1, pages.size)

      response(
        "Transcript of #{file.name} (page #{page} of #{pages.size})",
        structured: {
          file_id: file.id,
          file_name: file.name,
          language_code: result['language_code'],
          duration_seconds: result['audio_duration'],
          page: page,
          total_pages: pages.size,
          utterances: pages[page - 1]
        }
      )
    end

    private

    # Without speaker labels, the full text stands in as a single utterance.
    def utterances(result)
      raw = Array(result['utterances'])
      raw = [{ 'text' => result['text'] }] if raw.empty? && result['text'].present?
      raw.flat_map { |utterance| split(utterance) }
    end

    # Splits an utterance longer than a page at word boundaries, so that every
    # part fits on one page. Times in AssemblyAI results are in milliseconds.
    def split(utterance)
      text = utterance['text'].to_s
      # Each word counts with the space that joins it to the next one.
      parts = text.length > PAGE_CHARS ? pack(text.split) { |word| word.length + 1 } : [[text]]
      # A part's start is its first word's start, when the transcript has word
      # times for the utterance.
      word_times = Array(utterance['words']).pluck('start')
      first_word = 0

      parts.map do |part|
        start_ms = first_word.zero? ? utterance['start'] : word_times[first_word]
        first_word += part.size
        {
          speaker: utterance['speaker'],
          start_seconds: start_ms && (start_ms / 1000.0).round,
          text: part.join(' ')
        }
      end
    end

    # Always at least one page, so an empty transcript still has page 1.
    def paginate(utterances)
      pack(utterances) { |utterance| utterance[:text].length }.presence || [[]]
    end

    # Groups items in order so that each group's total size stays within
    # PAGE_CHARS. An item that is too big on its own gets a group to itself.
    def pack(items)
      groups = []
      group_size = 0
      items.each do |item|
        size = yield(item)
        if groups.empty? || group_size + size > PAGE_CHARS
          groups << []
          group_size = 0
        end
        groups.last << item
        group_size += size
      end
      groups
    end
  end
end
