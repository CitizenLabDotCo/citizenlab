module FlagInappropriateContent
  module Patches
    module SideFxSpamReportService

      def after_create spam_report, user
        super
        flaggable = spam_report.spam_reportable
        InappropriateContentFlag.create!(flaggable: flaggable) if !flaggable.inappropriate_content_flag
      end

      def after_destroy frozen_spam_report, current_user
        super
        flaggable = frozen_spam_report.spam_reportable
        flag = flaggable&.inappropriate_content_flag
        # if not flagged by NLP and there are no remaining spam reports
        if flag && !flag.toxicity_label && flaggable.reload.spam_reports.empty?
          flag.destroy!
        end
      end
    end
  end
end
