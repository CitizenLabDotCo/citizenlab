# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminApi::BulkDeleteUsersJob do
  subject(:job) { described_class.new }

  describe '#run' do
    it 'enqueues a DeleteUserJob for each user found by email' do
      user1 = create(:user)
      user2 = create(:user)

      expect(DeleteUserJob).to receive(:perform_later).with(user1)
      expect(DeleteUserJob).to receive(:perform_later).with(user2)

      job.run([user1.email, user2.email])
    end

    it 'matches emails case-insensitively' do
      user = create(:user, email: 'someone@example.com')

      expect(DeleteUserJob).to receive(:perform_later).with(user)

      job.run(['SomeOne@Example.com'])
    end

    it 'enqueues a DeleteUserJob for each user found by id' do
      user1 = create(:user)
      user2 = create(:user)

      expect(DeleteUserJob).to receive(:perform_later).with(user1)
      expect(DeleteUserJob).to receive(:perform_later).with(user2)

      job.run([], [user1.id, user2.id])
    end

    it 'enqueues deletions for users found by either email or id' do
      user_by_email = create(:user)
      user_by_id = create(:user)

      expect(DeleteUserJob).to receive(:perform_later).with(user_by_email)
      expect(DeleteUserJob).to receive(:perform_later).with(user_by_id)

      job.run([user_by_email.email], [user_by_id.id])
    end

    it 'enqueues a DeleteUserJob only once when a user is referenced by both email and id' do
      user = create(:user)

      expect(DeleteUserJob).to receive(:perform_later).with(user).once

      job.run([user.email], [user.id])
    end

    it 'enqueues a DeleteUserJob only once when the same email appears in multiple rows' do
      user = create(:user)

      expect(DeleteUserJob).to receive(:perform_later).with(user).once

      job.run([user.email, user.email])
    end

    it 'enqueues a DeleteUserJob only once when the same id appears in multiple rows' do
      user = create(:user)

      expect(DeleteUserJob).to receive(:perform_later).with(user).once

      job.run([], [user.id, user.id])
    end

    it 'reports an error and does not enqueue when an email is not found' do
      expect(DeleteUserJob).not_to receive(:perform_later)
      expect(ErrorReporter).to receive(:report_msg).with(
        'One or more users not found with given email(s) or id(s). See additional data for the email(s) and id(s).',
        extra: {
          emails_of_not_found_users: ['unknown@example.com'].to_s,
          ids_of_not_found_users: [].to_s
        }
      )

      job.run(['unknown@example.com'])
    end

    it 'reports an error and does not enqueue when an id is not found' do
      missing_id = SecureRandom.uuid

      expect(DeleteUserJob).not_to receive(:perform_later)
      expect(ErrorReporter).to receive(:report_msg).with(
        'One or more users not found with given email(s) or id(s). See additional data for the email(s) and id(s).',
        extra: {
          emails_of_not_found_users: [].to_s,
          ids_of_not_found_users: [missing_id].to_s
        }
      )

      job.run([], [missing_id])
    end

    it 'enqueues deletions for found users and reports only the missing ones' do
      user = create(:user)
      missing_id = SecureRandom.uuid

      expect(DeleteUserJob).to receive(:perform_later).with(user)
      expect(ErrorReporter).to receive(:report_msg).with(
        'One or more users not found with given email(s) or id(s). See additional data for the email(s) and id(s).',
        extra: {
          emails_of_not_found_users: ['unknown@example.com'].to_s,
          ids_of_not_found_users: [missing_id].to_s
        }
      )

      job.run([user.email, 'unknown@example.com'], [missing_id])
    end

    it 'deduplicates the reported not-found emails and ids' do
      missing_id = SecureRandom.uuid

      expect(DeleteUserJob).not_to receive(:perform_later)
      expect(ErrorReporter).to receive(:report_msg).with(
        'One or more users not found with given email(s) or id(s). See additional data for the email(s) and id(s).',
        extra: {
          emails_of_not_found_users: ['unknown@example.com'].to_s,
          ids_of_not_found_users: [missing_id].to_s
        }
      )

      job.run(['unknown@example.com', 'unknown@example.com'], [missing_id, missing_id])
    end

    it 'treats nil emails as an empty list' do
      user = create(:user)

      expect(DeleteUserJob).to receive(:perform_later).with(user).once
      expect(ErrorReporter).not_to receive(:report_msg)

      job.run(nil, [user.id])
    end

    it 'treats nil ids as an empty list' do
      user = create(:user)

      expect(DeleteUserJob).to receive(:perform_later).with(user).once
      expect(ErrorReporter).not_to receive(:report_msg)

      job.run([user.email], nil)
    end

    it 'reports an error and deletes nothing when both arguments are nil' do
      expect(DeleteUserJob).not_to receive(:perform_later)
      expect(ErrorReporter).to receive(:report_msg)
        .with('BulkDeleteUsersJob called with no emails or ids.')

      expect { job.run(nil, nil) }.not_to raise_error
    end

    it 'reports an error and deletes nothing when both arguments are empty' do
      expect(DeleteUserJob).not_to receive(:perform_later)
      expect(ErrorReporter).to receive(:report_msg)
        .with('BulkDeleteUsersJob called with no emails or ids.')

      job.run([], [])
    end

    it 'does not report an error when all users are found' do
      user = create(:user)

      allow(DeleteUserJob).to receive(:perform_later)
      expect(ErrorReporter).not_to receive(:report_msg)

      job.run([user.email], [user.id])
    end
  end
end
