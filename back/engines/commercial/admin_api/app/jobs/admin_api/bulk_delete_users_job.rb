# frozen_string_literal: true

class AdminApi::BulkDeleteUsersJob < ApplicationJob
  def run(emails = [], ids = [])
    emails = Array.wrap(emails)
    ids = Array.wrap(ids)

    if emails.empty? && ids.empty?
      ErrorReporter.report_msg('BulkDeleteUsersJob called with no emails or ids.')
      return
    end

    users_by_email = []
    emails_of_not_found_users = []

    emails.each do |email|
      user = User.find_by_cimail(email)

      if user
        users_by_email << user
      else
        emails_of_not_found_users << email
      end
    end

    users_by_id = User.where(id: ids).to_a
    ids_of_not_found_users = ids.map(&:to_s) - users_by_id.map { |user| user.id.to_s }

    (users_by_email + users_by_id).uniq.each do |user|
      DeleteUserJob.perform_later(user)
    end

    report_not_found(emails_of_not_found_users, ids_of_not_found_users)
  end

  private

  def report_not_found(emails_of_not_found_users, ids_of_not_found_users)
    emails_of_not_found_users = emails_of_not_found_users.uniq
    ids_of_not_found_users = ids_of_not_found_users.uniq

    return if emails_of_not_found_users.empty? && ids_of_not_found_users.empty?

    ErrorReporter.report_msg(
      'One or more users not found with given email(s) or id(s). See additional data for the email(s) and id(s).',
      extra: {
        emails_of_not_found_users: emails_of_not_found_users.to_s,
        ids_of_not_found_users: ids_of_not_found_users.to_s
      }
    )
  end
end
