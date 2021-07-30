module FlagInappropriateContent
  module Patches
    module SideFxSpamReportService

      def after_create spam_report, user
        super
        FlagInappropriateContent::InappropriateContentFlagService.new.introduce_flag! spam_report.spam_reportable
      end

      def after_destroy frozen_spam_report, current_user
        super
        flaggable = frozen_spam_report.spam_reportable
        flag = flaggable&.inappropriate_content_flag
        FlagInappropriateContent::InappropriateContentFlagService.new.maybe_delete! flag if flag
      end
    end
  end
end
