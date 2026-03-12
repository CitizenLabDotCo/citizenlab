# frozen_string_literal: true

module FlagInappropriateContent
  class InappropriateContentFlagService
    def introduce_flag!(flaggable, attributes = {})
      reuse_flag = flaggable.inappropriate_content_flag
      flag = reuse_flag || InappropriateContentFlag.new(flaggable: flaggable)
      was_deleted = flag.deleted?
      flag.assign_attributes attributes
      flag.deleted_at = nil # re-introduce flag if it was marked as deleted
      flag.save!

      LogActivityJob.perform_later(flag, 'created', nil, flag.created_at.to_i) unless reuse_flag
      LogActivityJob.perform_later(flaggable, 'flagged_for_inappropriate_content', nil, flag.created_at.to_i) if !reuse_flag || was_deleted

      flag
    end

    def maybe_delete!(flag)
      # if not flagged by NLP and there are no remaining spam reports
      return unless !flag.toxicity_label && flag.flaggable.spam_reports.empty?

      flag.destroy!
      LogActivityJob.perform_later(flag, 'deleted', nil, Time.now.to_i)
    end
  end
end
