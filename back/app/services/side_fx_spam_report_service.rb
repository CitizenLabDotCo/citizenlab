class SideFxSpamReportService
  include SideFxHelper

  def after_create spam_report, current_user
    LogActivityService.new.run(spam_report, "created", current_user, spam_report.created_at.to_i)
  end

  def after_update spam_report, current_user
    LogActivityService.new.run(spam_report, 'changed', current_user, spam_report.updated_at.to_i)
  end

  def after_destroy frozen_spam_report, current_user
    serialized_spam_report = clean_time_attributes(frozen_spam_report.attributes)
    LogActivityService.new.run(
      encode_frozen_resource(frozen_spam_report), 
      "deleted", 
      current_user, 
      Time.now.to_i, 
      payload: {spam_report: serialized_spam_report}
    )
  end
end

::SideFxSpamReportService.prepend_if_ee('FlagInappropriateContent::Patches::SideFxSpamReportService')
