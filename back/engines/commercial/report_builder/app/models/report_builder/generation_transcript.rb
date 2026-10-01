# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_generation_transcripts
#
#  id              :uuid             not null, primary key
#  report_id       :uuid             not null
#  model           :string           default(""), not null
#  messages        :jsonb            not null
#  usage           :jsonb            not null
#  stopped_because :string           default("done"), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_report_builder_generation_transcripts_on_report_id  (report_id)
#
# Foreign Keys
#
#  fk_rails_...  (report_id => report_builder_reports.id) ON DELETE => cascade
#
module ReportBuilder
  # What the model was told and what it did, for one generation run.
  #
  # A run is minutes of paid work behind a background job with nobody watching. When
  # one produces a disappointing report, or none at all, this is the only way to tell
  # a bad prompt from a bad reply from a broken tool — everything else the run leaves
  # behind is the outcome, not the reasoning.
  #
  # Kept per run rather than per report: comparing a failed run with the one before it
  # is exactly the question worth asking.
  class GenerationTranscript < ApplicationRecord
    STOP_REASONS = %w[done round_cap failed].freeze

    belongs_to :report, class_name: 'ReportBuilder::Report'

    validates :stopped_because, inclusion: { in: STOP_REASONS }

    scope :newest_first, -> { order(created_at: :desc) }

    def rounds
      messages.count { |message| message['role'] == 'assistant' }
    end

    # What the run cost, once the provider's cache is taken into account. A cache read
    # figure of zero on a multi-round run means the prompt is not stable and every
    # round is being paid for in full.
    def cache_read_tokens = usage['cache_read_input_tokens'].to_i
  end
end
