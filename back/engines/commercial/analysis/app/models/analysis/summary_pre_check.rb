# frozen_string_literal: true

module Analysis
  # This is NOT an ActiveRecord model, it's not stored in the database. It
  # contains data on how well the summarization method estimates it can
  # summarize a given task, before actually doing the task.
  class SummaryPreCheck
    include ActiveModel::API

    QUALITIES = %i[low medium high]
    IMPOSSIBLE_REASONS = [:too_many_inputs]

    attr_accessor :quality, :impossible_reason

    validates :quality, inclusion: { in: QUALITIES }, allow_blank: true
    validates :quality, presence: true, if: -> { impossible_reason.blank? }
    validates :impossible_reason, inclusion: { in: IMPOSSIBLE_REASONS }, allow_blank: true
    validates :impossible_reason, presence: true, if: -> { quality.blank? }

    def id
      @id ||= SecureRandom.uuid
    end
  end
end
