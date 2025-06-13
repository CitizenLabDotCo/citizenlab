# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_background_tasks
#
#  id                  :uuid             not null, primary key
#  analysis_id         :uuid             not null
#  type                :string           not null
#  state               :string           not null
#  progress            :float
#  started_at          :datetime
#  ended_at            :datetime
#  auto_tagging_method :string
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  tags_ids            :jsonb
#  filters             :jsonb            not null
#
# Indexes
#
#  index_analysis_background_tasks_on_analysis_id  (analysis_id)
#
# Foreign Keys
#
#  fk_rails_...  (analysis_id => analysis_analyses.id)
#
module Analysis
  class BackgroundTask < ::ApplicationRecord
    TYPES = ['Analysis::AutoTaggingTask', 'Analysis::SummarizationTask', 'Analysis::QAndATask', 'Analysis::CommentsSummarizationTask']
    STATES = %w[queued in_progress succeeded failed]

    belongs_to :analysis
    has_many :activities, as: :item

    validates :type, inclusion: { in: TYPES }
    validates :state, presence: true, inclusion: { in: STATES }
    validates :progress, numericality: { in: 0..1 }, allow_blank: true

    validate :progress_nil_when_not_in_progress
    validate :started_at_set_when_started
    validate :ended_at_set_when_ended

    before_validation :set_default_state

    def insightable
      [Summary, Question, CommentsSummary].find do |insightable_class|
        insightable_class.find_by(background_task_id: id)
      end
    end

    def finished?
      %w[succeeded failed].include?(state)
    end

    def set_in_progress!
      self.state = 'in_progress'
      self.started_at = Time.now
      save!
      insightable&.update!(generated_at: nil)
    end

    def set_succeeded!
      self.state = 'succeeded'
      self.progress = nil
      self.ended_at = Time.now
      save!
      insightable&.update!(generated_at: Time.now)
    end

    def set_failed!
      self.state = 'failed'
      self.progress = nil
      self.ended_at = Time.now
      save!
    end

    def task_type
      self.class.name.demodulize.underscore
    end

    private

    def progress_nil_when_not_in_progress
      if state != 'in_progress' && !progress.nil?
        errors.add(:progress, :cant_be_set_if_not_in_progress, message: 'Progress can\'t be a number while the task is not in progress')
      end
    end

    def started_at_set_when_started
      if state != 'queued' && started_at.blank?
        errors.add(:started_at, :should_be_set_when_started, message: 'Started_at should be defined when the task is in a state where it has been started')
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
