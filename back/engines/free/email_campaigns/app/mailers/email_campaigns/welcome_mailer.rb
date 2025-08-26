# frozen_string_literal: true

module EmailCampaigns
  class WelcomeMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      { recipient: recipient }
    end
  end
end
