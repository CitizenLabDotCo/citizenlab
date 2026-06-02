# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:reset_users_in_email_limbo rake task' do
  before { load_rake_tasks_if_not_loaded }
  after { Rake::Task['single_use:reset_users_in_email_limbo'].reenable }

  def run_task(execute: false)
    Rake::Task['single_use:reset_users_in_email_limbo'].invoke(execute ? 'execute' : nil)
  end

  let!(:unconfirmed_user) { create(:unconfirmed_user) }
  let!(:full_user) { create(:user) }
  let!(:full_user_with_identity) do
    create(:user, identities: [create(:identity, provider: 'fake_sso')])
  end
  let!(:full_user_with_identity_and_unconfirmed_email) do
    create(:unconfirmed_user, identities: [create(:identity, provider: 'fake_sso')])
  end
  let!(:full_user_with_identity_and_unconfirmed_email_and_new_email) do
    create(:unconfirmed_user, new_email: 'new@email.com', identities: [create(:identity, provider: 'fake_sso')])
  end

  context 'dry-run mode' do
    it 'does not modify users in email limbo' do
      run_task(execute: false)

      expect(unconfirmed_user.reload.new_email).to be_nil
      expect(full_user.reload.new_email).to be_nil
      expect(full_user_with_identity.reload.new_email).to be_nil
      expect(full_user_with_identity_and_unconfirmed_email.reload.new_email).to be_nil
      expect(full_user_with_identity_and_unconfirmed_email_and_new_email.reload.new_email).to eq('new@email.com')
    end
  end

  context 'execute mode' do
    it 'copies email to new_email for users in email limbo' do
      limbo_email = full_user_with_identity_and_unconfirmed_email.email

      run_task(execute: true)

      expect(unconfirmed_user.reload.new_email).to be_nil
      expect(full_user.reload.new_email).to be_nil
      expect(full_user_with_identity.reload.new_email).to be_nil
      expect(full_user_with_identity_and_unconfirmed_email.reload.new_email).to eq(limbo_email)
      expect(full_user_with_identity_and_unconfirmed_email_and_new_email.reload.new_email).to eq('new@email.com')
    end
  end
end
# rubocop:enable RSpec/DescribeClass
