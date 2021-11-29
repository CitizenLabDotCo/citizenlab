class AdminApi::BulkDeleteUsersJob < ApplicationJob
  def run(emails)
    emails.each do |email|
      ErrorReporter.handle do
        user = User.find_by_cimail(email) || raise("No user with email #{email} found")
        DeleteUserJob.perform_later(user)
      end
    end
  end
end
