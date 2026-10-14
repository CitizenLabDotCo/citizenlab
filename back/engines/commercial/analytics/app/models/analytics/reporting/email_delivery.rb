# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_email_deliveries
#
#  campaign_id     :uuid
#  campaign_type   :text
#  manual          :boolean
#  subject         :text
#  project_id      :uuid
#  sent_date       :date
#  sent_count      :integer
#  bounced_count   :integer
#  failed_count    :integer
#  accepted_count  :integer
#  delivered_count :integer
#  opened_count    :integer
#  clicked_count   :integer
#
module Analytics
  module Reporting
    class EmailDelivery < Analytics::ApplicationRecordView
      self.table_name = 'reporting_email_deliveries'
      self.primary_key = nil

      def self.table_description
        <<~DOC.squish
          Emails the platform sent, as totals per campaign and day sent: how
          many were sent, delivered, opened and clicked. There are no rows per
          recipient, so it can't tell who received or opened an email. Use it
          to show when outreach happened and how big it was, for example next
          to participation over time. Outreach means manual = TRUE: emails
          administrators wrote and sent. The other campaigns are automatic
          notifications, including transactional ones (password resets,
          confirmation codes) and digests for staff. SUM the counts across days
          for a campaign's totals, which then match the campaign page.
          Email only: SMS messages are not included. Deleting an account
          deletes its deliveries, so totals can shrink over time, on the
          campaign page too.
        DOC
      end

      def self.field_descriptions
        {
          'campaign_id' => 'The campaign. Group on it for per-campaign totals.',
          'campaign_type' => <<~DOC.squish,
            Kind of campaign, for example 'manual' (an email to chosen
            recipients), 'manual_project_participants' (an email to a project's
            participants and followers), 'project_phase_started' or
            'password_reset'.
          DOC
          'manual' => 'TRUE for emails administrators wrote and sent, FALSE for automatic notifications.',
          'subject' => <<~DOC.squish,
            Subject of a manual campaign, resolved to the platform primary
            locale. NULL for automatic notifications.
          DOC
          'project_id' => <<~DOC.squish,
            The project the campaign is about: set for emails to a project's
            participants and for notifications about one phase. NULL for
            platform-wide campaigns. LEFT JOIN reporting_projects.
          DOC
          'sent_date' => 'Day the emails were sent, in the platform timezone.',
          'sent_count' => 'Emails sent.',
          'bounced_count' => 'Emails the recipient\'s mail server rejected.',
          'failed_count' => 'Emails that could not be sent.',
          'accepted_count' => 'Emails the mail service accepted, including those delivered, opened or clicked later.',
          'delivered_count' => 'Emails delivered, including those opened or clicked later.',
          'opened_count' => <<~DOC.squish,
            Emails opened, including those clicked. Unreliable on its own:
            some email apps (Apple Mail in particular) open every email
            automatically. Prefer clicked_count as the sign of engagement, and
            say so if you report opens.
          DOC
          'clicked_count' => 'Emails in which the recipient clicked a link. The reliable sign of engagement.'
        }
      end

      def self.foreign_keys
        { 'project_id' => 'reporting_projects.id' }
      end
    end
  end
end
