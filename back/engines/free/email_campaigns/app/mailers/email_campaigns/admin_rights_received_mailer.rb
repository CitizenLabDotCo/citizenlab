# frozen_string_literal: true

module EmailCampaigns
  class AdminRightsReceivedMailer < ApplicationMailer
    include EditableWithPreview

    def editable_region_variable_keys
      %w[organizationName]
    end

    def preview_command(recipient: nil)
      data = PreviewService.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          organization_name: data.organization_name
        }
      }
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end
  end
end
