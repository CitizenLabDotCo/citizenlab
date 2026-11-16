# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:move_unconfirmed_emails_of_sso_users_to_new_email' do
  before { load_rake_tasks_if_not_loaded }

  after do
    task.reenable
    FileUtils.rm_f(%w[
      move_unconfirmed_emails_of_sso_users_to_new_email.json
      move_unconfirmed_emails_of_sso_users_to_new_email_dry_run.json
    ])
  end

  let(:task) { Rake::Task['single_use:move_unconfirmed_emails_of_sso_users_to_new_email'] }
  let!(:limbo_user) { with_identity(create(:unconfirmed_user)) }

  def run(execute: true)
    task.invoke(execute ? 'execute' : nil)
  end

  def reported_changes(dry_run: false)
    file = "move_unconfirmed_emails_of_sso_users_to_new_email#{'_dry_run' if dry_run}.json"
    JSON.parse(File.read(file))['changes']
  end

  def with_identity(user)
    create(:identity, provider: 'fake_sso', user: user)
    user
  end

  it 'moves the unconfirmed email to new_email and clears email' do
    email = limbo_user.email

    run

    expect(limbo_user.reload).to have_attributes(email: nil, new_email: email, confirmation_required: true)
  end

  it 'clears the bounce that belonged to the old email' do
    limbo_user.update_columns(email_bounced_at: Time.zone.now, email_bounce_reason: 'hard bounce')

    run

    expect(limbo_user.reload).to have_attributes(email_bounced_at: nil, email_bounce_reason: nil)
  end

  it 'deletes the email confirmation, whose code was for the old email' do
    limbo_user.find_or_create_confirmation(:email_confirmation)

    run

    expect(EmailConfirmation.where(user: limbo_user)).not_to exist
  end

  it 'leaves the user to confirm their new email' do
    run

    expect(limbo_user.reload.confirmation_pending?(:new_email_confirmation)).to be true
  end

  it 'leaves users who are not in limbo alone' do
    confirmed_sso_user = with_identity(create(:user))
    unconfirmed_user_without_identity = create(:unconfirmed_user)
    invitee = with_identity(create(:invited_user))

    expect { run }.not_to(change do
      [confirmed_sso_user, unconfirmed_user_without_identity, invitee].map { |u| u.reload.email }
    end)
  end

  it 'only clears email when new_email already holds the same address' do
    limbo_user.update_columns(new_email: limbo_user.email.upcase)
    new_email = limbo_user.new_email

    run

    expect(limbo_user.reload).to have_attributes(email: nil, new_email: new_email)
  end

  it 'keeps another pending new_email and reports the dropped address' do
    email = limbo_user.email
    limbo_user.update_columns(new_email: 'other@example.com')

    run

    expect(limbo_user.reload).to have_attributes(email: nil, new_email: 'other@example.com')
    expect(reported_changes.sole['context']).to include('outcome' => 'cleared_other_new_email_kept', 'dropped_email' => email)
  end

  it 'keeps a pending merge_target_email' do
    limbo_user.update_columns(merge_target_email: 'owner@example.com')

    run

    expect(limbo_user.reload).to have_attributes(email: nil, new_email: nil, merge_target_email: 'owner@example.com')
  end

  it 'does not report the address it moves' do
    run

    expect(reported_changes.sole['context']).to include('outcome' => 'moved_to_new_email')
    expect(reported_changes.sole['context']).not_to have_key('dropped_email')
  end

  it 'writes nothing on a dry run' do
    email = limbo_user.email

    run(execute: false)

    expect(limbo_user.reload).to have_attributes(email: email, new_email: nil)
    expect(reported_changes(dry_run: true).size).to eq 1
  end
end
# rubocop:enable RSpec/DescribeClass
