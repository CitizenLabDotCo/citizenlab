module EmailCampaigns
  class YourProposedInitiativesDigestMailer < ApplicationMailer
    protected

    def subject
      format_message('subject')
    end

    private

    def header_title
      format_message('title_your_weekly_report')
    end

    def header_message
      format_message('text_introduction')
    end

    def preheader
      format_message('preheader')
    end
  end
end