# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:delete_used_confirmations rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:delete_used_confirmations'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:report_path) { Rails.root.join('delete_used_confirmations.json') }
  let(:dry_run_report_path) { Rails.root.join('delete_used_confirmations_dry_run.json') }

  def run_task(dry_run: false)
    Rake::Task['single_use:delete_used_confirmations'].invoke(dry_run ? nil : 'execute', nil)
  end

  it 'deletes an email confirmation of a user who no longer requires confirmation' do
    user = create(:user)
    confirmation = EmailConfirmation.create!(user: user, code_sent_at: 1.year.ago)

    run_task

    expect(EmailConfirmation.where(id: confirmation.id)).to be_empty
  end

  it 'keeps an email confirmation of a user who still has to confirm' do
    user = create(:unconfirmed_user)
    confirmation = EmailConfirmation.create!(user: user)

    run_task

    expect(confirmation.reload).to be_present
  end

  # The re-confirmation flow: the user confirmed long ago, so nothing about the user says a
  # confirmation is pending, but they are holding a code they are about to type.
  it 'keeps a confirmation with an outstanding code' do
    user = create(:user)
    confirmation = EmailConfirmation.create!(user: user, code: '123456', code_sent_at: Time.zone.now)

    run_task

    expect(confirmation.reload).to be_present
  end

  it 'deletes a new email confirmation once the change went through' do
    user = create(:user)
    confirmation = NewEmailConfirmation.create!(user: user)

    run_task

    expect(NewEmailConfirmation.where(id: confirmation.id)).to be_empty
  end

  it 'keeps a new email confirmation while the change is in flight' do
    user = create(:user, new_email: 'new@example.com')
    confirmation = NewEmailConfirmation.create!(user: user)

    run_task

    expect(confirmation.reload).to be_present
  end

  it 'deletes a phone confirmation of a user whose number is confirmed' do
    user = create(:user, :with_confirmed_phone)
    confirmation = PhoneConfirmation.create!(user: user)

    run_task

    expect(PhoneConfirmation.where(id: confirmation.id)).to be_empty
  end

  it 'keeps a phone confirmation of a user whose number is not confirmed yet' do
    user = create(:unconfirmed_phone_user)
    confirmation = PhoneConfirmation.create!(user: user)

    run_task

    expect(confirmation.reload).to be_present
  end

  it 'deletes a new phone confirmation once the change went through' do
    user = create(:user)
    confirmation = NewPhoneConfirmation.create!(user: user)

    run_task

    expect(NewPhoneConfirmation.where(id: confirmation.id)).to be_empty
  end

  it 'keeps a new phone confirmation while the change is in flight' do
    user = create(:user, new_phone: '+14155552671')
    confirmation = NewPhoneConfirmation.create!(user: user)

    run_task

    expect(confirmation.reload).to be_present
  end

  it 'deletes nothing on a dry run' do
    user = create(:user)
    confirmation = EmailConfirmation.create!(user: user)

    run_task(dry_run: true)

    expect(confirmation.reload).to be_present
    expect(JSON.parse(File.read(dry_run_report_path))['deletes'].size).to eq 1
  end
end
# rubocop:enable RSpec/DescribeClass
