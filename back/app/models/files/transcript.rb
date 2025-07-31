# frozen_string_literal: true

# == Schema Information
#
# Table name: files_transcripts
#
#  id            :uuid             not null, primary key
#  file_id       :uuid             not null
#  status        :string           default("pending"), not null
#  assemblyai_id :string
#  text          :text
#  confidence    :float
#  language_code :string
#  words         :jsonb
#  utterances    :jsonb
#  metadata      :jsonb
#  features      :jsonb
#  error_message :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_files_transcripts_on_file_id  (file_id) UNIQUE
#  index_files_transcripts_on_status   (status)
#
# Foreign Keys
#
#  fk_rails_...  (file_id => files.id)
#
module Files
  class Transcript < ApplicationRecord
    self.table_name = 'files_transcripts'

    STATUSES = %w[pending processing completed failed].freeze

    belongs_to :file, class_name: 'Files::File'

    validates :status, presence: true, inclusion: { in: STATUSES }
    validates :file_id, uniqueness: true

    validates :words, json: { schema: -> { self.class.words_json_schema } }
    validates :utterances, json: { schema: -> { self.class.utterances_json_schema } }
    validates :metadata, json: { schema: -> { self.class.metadata_json_schema } }
    validates :features, json: { schema: -> { self.class.features_json_schema } }

    scope :pending, -> { where(status: 'pending') }
    scope :processing, -> { where(status: 'processing') }
    scope :completed, -> { where(status: 'completed') }
    scope :failed, -> { where(status: 'failed') }

    def completed?
      status == 'completed'
    end

    def failed?
      status == 'failed'
    end

    def processing?
      status == 'processing'
    end

    def pending?
      status == 'pending'
    end

    class << self
      def words_json_schema
        {
          'type' => 'array',
          'items' => {
            'type' => 'object',
            'properties' => {
              'text' => { 'type' => 'string' },
              'start' => { 'type' => 'number' },
              'end' => { 'type' => 'number' },
              'confidence' => { 'type' => 'number' },
              'speaker' => { 'type' => %w[string null] }
            },
            'required' => %w[text start end confidence],
            'additionalProperties' => false
          }
        }
      end

      def utterances_json_schema
        {
          'type' => 'array',
          'items' => {
            'type' => 'object',
            'properties' => {
              'speaker' => { 'type' => 'string' },
              'text' => { 'type' => 'string' },
              'start' => { 'type' => 'number' },
              'end' => { 'type' => 'number' },
              'confidence' => { 'type' => 'number' },
              'words' => {
                'type' => 'array',
                'items' => { 'type' => 'object' }
              }
            },
            'required' => %w[speaker text start end confidence],
            'additionalProperties' => false
          }
        }
      end

      def metadata_json_schema
        {
          'type' => 'object',
          'additionalProperties' => true
        }
      end

      def features_json_schema
        {
          'type' => 'object',
          'properties' => {
            'speaker_labels' => { 'type' => %w[boolean null] },
            'summarization' => { 'type' => %w[boolean null] },
            'auto_highlights' => { 'type' => %w[boolean null] },
            # 'content_safety' => { 'type' => %w[boolean null] },
            'entity_detection' => { 'type' => %w[boolean null] },
            'sentiment_analysis' => { 'type' => %w[boolean null] }
          },
          'additionalProperties' => true
        }
      end
    end
  end
end
