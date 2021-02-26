module EmailCampaigns
  class PasswordResetMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def show_header?
      false
    end
  end
end
