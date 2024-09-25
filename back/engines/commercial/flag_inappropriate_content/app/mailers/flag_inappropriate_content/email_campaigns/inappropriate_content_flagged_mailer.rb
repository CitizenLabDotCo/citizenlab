# frozen_string_literal: true

module FlagInappropriateContent
  module EmailCampaigns
    class InappropriateContentFlaggedMailer < ::EmailCampaigns::ApplicationMailer
      protected

      def preheader
        format_message('preheader')
      end

      def subject
        format_message('subject')
      end

      private

      def header_title
        format_message('header_title')
      end

      def header_message
        false
      end
    end
  end
end
