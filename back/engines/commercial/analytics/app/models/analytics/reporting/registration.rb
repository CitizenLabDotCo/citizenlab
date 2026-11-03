# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_registrations
#
#  started_date    :date
#  sign_up_method  :text
#  sso_provider    :text
#  started_count   :integer
#  completed_count :integer
#
module Analytics
  module Reporting
    class Registration < Analytics::ApplicationRecordView
      self.table_name = 'reporting_registrations'
      self.primary_key = nil

      def self.table_description
        <<~DOC.squish
          The sign-up funnel, as totals per day sign-up started and sign-up
          method: how many people started signing up and how many of them
          completed registration. There are no rows per person. Use it to show
          where people drop out of sign-up, and which methods work best:
          completion rate = SUM(completed_count) / SUM(started_count). Unlike
          reporting_users, it includes people who never finished.
          Completions are counted against the day the sign-up started; for
          completions by the day they happened, count reporting_users by
          registered_at. Each attempt counts: someone who stopped and tried
          again later counts as two starts. "Completed" means the person
          confirmed their account (email or phone code, or a sign-in service);
          it says nothing about answering the sign-up questions.
          There is no acquisition source here. To see where people came from,
          take each user's earliest reporting_sessions row, which is normally
          the visit in which they signed up, and group by the referrer's site.
          Merge a site's variants, such as l.facebook.com and facebook.com. A
          NULL referrer means unknown (email apps, QR codes, typed addresses),
          often half of sign-ups or more. For sign-ups through a sign-in
          service, the referrer is usually that service's login page.
          Data limits, say them when they matter: sign-ups before 2024-08-15
          have no method (sign_up_method NULL). Before October 2026,
          invitations nobody accepted read as 'email_confirmation' sign-ups
          that never completed, which makes that method's completion rate look
          lower than it was.
        DOC
      end

      def self.field_descriptions
        {
          'started_date' => <<~DOC.squish,
            Day the sign-up started (the account was created), in the platform
            timezone. For 'invitation', the day the person was invited.
          DOC
          'sign_up_method' => <<~DOC.squish,
            How the person signed up: 'email_confirmation' (email with a
            one-time code, no password), 'email_password' (email and password),
            'phone_confirmation' (phone number with a text code), 'sso' (a
            sign-in service, see sso_provider) or 'invitation' (invited by an
            administrator; completed means they accepted). NULL for sign-ups
            before 2024-08-15, when the method wasn't recorded yet.
          DOC
          'sso_provider' => <<~DOC.squish,
            For 'sso', which sign-in service, for example 'google',
            'franceconnect' or 'azureactivedirectory'. NULL for other methods.
          DOC
          'started_count' => 'People who started signing up.',
          'completed_count' => 'Of those who started, how many completed registration, at any time since.'
        }
      end

      def self.foreign_keys
        {}
      end
    end
  end
end
