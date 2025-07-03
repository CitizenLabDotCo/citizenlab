# frozen_string_literal: true

module EmailCampaigns
  class AdminRightsReceivedMailer < ApplicationMailer
    include EditableWithPreview

    class << self
      def editable_regions
        [
          define_editable_region(
            :subject_multiloc, default_message_key: 'subject'
          ),
          define_editable_region(
            :title_multiloc, default_message_key: 'title_you_became_administrator'
          ),
          define_editable_region(
            :intro_multiloc, default_message_key: 'message_you_became_administrator', type: 'html', allow_blank_locales: true
          ),
          define_editable_region(
            :button_text_multiloc, default_message_key: 'cta_manage_platform'
          )
        ]
      end

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
    end

    protected

    def substitution_variables
      {
        organizationName: organization_name
      }
    end
  end
end
