module Analysis
  class BackgroundTask < ::ApplicationRecord
    TYPES = ['Analysis::AutoTaggingTask']
    # auto_tagging_method_map =
    STATES = %w[queued in_progress succeeded failed]

    belongs_to :analysis

    validates :type, inclusion: { in: TYPES }
    validates :progress, numericality: { in: 0..1 }, allow_blank: true

    validate :progress_nil_when_not_in_progress
    validate :ended_at_set_when_ended

    before_validation :set_default_state

    private

    def progress_nil_when_not_in_progress
      if state == 'in_progress' && !progress.nil?
        errors.add(:progress, :cant_be_set_if_not_in_progress, message: 'Progress can\'t be a number while the task is not in progress')
      end
    end

    def ended_at_set_when_ended
      if %w[succeeded failed].include?(state) && ended_at.blank?
        errors.add(:ended_at, :should_be_set_when_ended, message: 'Ended_at should be defined when the task is in an end state (succedded, failed)')
      end
    end

    def set_default_state
      self.state ||= 'queued'
    end
  end
end
