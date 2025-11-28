# frozen_string_literal: true

# == Schema Information
#
# Table name: files_transcripts
#
#  id                    :uuid             not null, primary key
#  file_id               :uuid             not null
#  status                :string           default("pending"), not null
#  assemblyai_id         :string
#  assemblyai_transcript :jsonb
#  error_message         :string
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
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
    class << self
      def assemblyai_transcript_json_schema
        @assemblyai_transcript_json_schema ||= JSON.parse(Rails.root.join('config/schemas/assembly_ai_transcript.json_schema').read)
      end
    end

    belongs_to :file, class_name: 'Files::File'
    validates :status, presence: true, inclusion: { in: STATUSES }
    validates :file_id, uniqueness: true
    validates :assemblyai_transcript, json: { schema: -> { self.class.assemblyai_transcript_json_schema } }, allow_nil: true

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
  end
end
