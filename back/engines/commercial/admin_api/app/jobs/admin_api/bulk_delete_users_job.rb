# frozen_string_literal: true

class AdminApi::BulkDeleteUsersJob < ApplicationJob
  def run(emails)
    emails_of_not_found_users = []

    emails.each do |email|
      user = User.find_by_cimail(email)

      if user
        DeleteUserJob.perform_later(user)
      else
        emails_of_not_found_users << email
      end
    end

    return unless emails_of_not_found_users.count.positive?

    ErrorReporter.report_msg(
      'One or more users not found with given email(s). See additional data for email(s).',
      extra: { emails_of_not_found_users: emails_of_not_found_users.to_s }
    )
  end
end
