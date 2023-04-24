# frozen_string_literal: true

class SideFxSpamReportService
  include SideFxHelper

  def after_create(spam_report, current_user)
    LogActivityJob.perform_later(spam_report, 'created', current_user, spam_report.created_at.to_i)
  end

  def after_update(spam_report, current_user)
    LogActivityJob.perform_later(spam_report, 'changed', current_user, spam_report.updated_at.to_i)
  end

  def after_destroy(frozen_spam_report, current_user)
    serialized_spam_report = clean_time_attributes(frozen_spam_report.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_spam_report),
      'deleted',
      current_user,
      Time.now.to_i,
      payload: { spam_report: serialized_spam_report }
    )
  end
end

SideFxSpamReportService.prepend(FlagInappropriateContent::Patches::SideFxSpamReportService)
