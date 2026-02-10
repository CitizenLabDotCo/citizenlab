# frozen_string_literal: true

FactoryBot.define do
  factory :file_transcript, class: 'Files::Transcript' do
    association :file
    status { 'pending' }
    assemblyai_id { nil }
    assemblyai_transcript { nil }
    error_message { nil }

    trait :processing do
      status { 'processing' }
      assemblyai_id { SecureRandom.uuid }
    end

    trait :completed do
      status { 'completed' }
      assemblyai_id { SecureRandom.uuid }
      assemblyai_transcript do
        {
          'id' => SecureRandom.uuid,
          'status' => 'completed',
          'text' => 'This is a sample transcript of the audio file.',
          'confidence' => 0.95,
          'language_code' => 'en',
          'words' => [
            { 'text' => 'This', 'start' => 0.0, 'end' => 0.2, 'confidence' => 0.99 },
            { 'text' => 'is', 'start' => 0.2, 'end' => 0.3, 'confidence' => 0.98 },
            { 'text' => 'a', 'start' => 0.3, 'end' => 0.4, 'confidence' => 0.99 },
            { 'text' => 'sample', 'start' => 0.4, 'end' => 0.7, 'confidence' => 0.97 },
            { 'text' => 'transcript', 'start' => 0.7, 'end' => 1.2, 'confidence' => 0.96 }
          ]
        }
      end
    end

    trait :failed do
      status { 'failed' }
      assemblyai_id { SecureRandom.uuid }
      error_message { 'Transcription failed: Invalid audio format' }
    end
  end
end
