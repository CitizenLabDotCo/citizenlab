# frozen_string_literal: true

FactoryBot.define do
  factory :file_transcript, class: 'Files::Transcript' do
    association :file
    status { 'pending' }
    assemblyai_id { nil }
    text { nil }
    confidence { nil }
    language_code { nil }
    words { [] }
    utterances { [] }
    metadata { {} }
    features { {} }
    error_message { nil }

    trait :processing do
      status { 'processing' }
      assemblyai_id { SecureRandom.uuid }
    end

    trait :completed do
      status { 'completed' }
      assemblyai_id { SecureRandom.uuid }
      text { 'This is a sample transcript of the audio file.' }
      confidence { 0.95 }
      language_code { 'en' }
      words do
        [
          { 'text' => 'This', 'start' => 0.0, 'end' => 0.2, 'confidence' => 0.99 },
          { 'text' => 'is', 'start' => 0.2, 'end' => 0.3, 'confidence' => 0.98 },
          { 'text' => 'a', 'start' => 0.3, 'end' => 0.4, 'confidence' => 0.99 },
          { 'text' => 'sample', 'start' => 0.4, 'end' => 0.7, 'confidence' => 0.97 },
          { 'text' => 'transcript', 'start' => 0.7, 'end' => 1.2, 'confidence' => 0.96 }
        ]
      end
      utterances do
        [
          {
            'speaker' => 'A',
            'text' => 'This is a sample transcript of the audio file.',
            'start' => 0.0,
            'end' => 2.0,
            'confidence' => 0.95,
            'words' => words
          }
        ]
      end
      metadata do
        {
          'audio_duration' => 120.5,
          'audio_url' => 'https://example.com/audio.mp3',
          'punctuate' => true,
          'format_text' => true
        }
      end
      features do
        {
          'speaker_labels' => true,
          'summarization' => false,
          'auto_highlights' => false,
          'content_safety' => false
        }
      end
    end

    trait :failed do
      status { 'failed' }
      assemblyai_id { SecureRandom.uuid }
      error_message { 'Transcription failed: Invalid audio format' }
    end

    trait :with_summarization do
      completed
      features do
        {
          'speaker_labels' => true,
          'summarization' => true,
          'auto_highlights' => false,
          'content_safety' => false
        }
      end
      metadata do
        {
          'audio_duration' => 120.5,
          'audio_url' => 'https://example.com/audio.mp3',
          'punctuate' => true,
          'format_text' => true,
          'summary' => 'This audio discusses a sample topic with relevant information.'
        }
      end
    end
  end
end
