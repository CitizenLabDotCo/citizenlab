# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::UserQuestionAnswer do
  it 'exposes select answers with their question metadata' do
    field = create(:custom_field_gender, :with_options)
    user = create(:user, custom_field_values: { 'gender' => 'male' })
    row = described_class.find_by!(user_id: user.id)

    expect(row.question_id).to eq field.id
    expect(row.question_key).to eq 'gender'
    expect(row.question_type).to eq 'select'
    expect(row.question_label).to eq 'gender'
    expect(row.answer_value).to eq 'male'
  end

  it 'explodes multi-select answers into one row per selected option' do
    field = create(:custom_field_multiselect, :with_options)
    user = create(:user)
    user.update_column(:custom_field_values, { field.key => %w[option1 option2] })

    expect(described_class.where(user_id: user.id).pluck(:answer_value)).to match_array %w[option1 option2]
  end

  it 'exposes number answers like birthyear as text' do
    create(:custom_field_birthyear)
    user = create(:user)
    user.update_column(:custom_field_values, { 'birthyear' => 1990 })

    expect(described_class.find_by!(user_id: user.id).answer_value).to eq '1990'
  end

  it 'has no rows for unanswered questions or disabled fields' do
    create(:custom_field_gender, :with_options, enabled: false)
    unanswered = create(:user)
    answered_disabled = create(:user)
    answered_disabled.update_column(:custom_field_values, { 'gender' => 'male' })

    expect(described_class.where(user_id: [unanswered.id, answered_disabled.id])).to be_empty
  end

  it 'has no rows for users excluded from reporting_users' do
    create(:custom_field_gender, :with_options)
    pending_invite = create(:user, invite_status: 'pending', registration_completed_at: nil)
    pending_invite.update_column(:custom_field_values, { 'gender' => 'male' })

    expect(described_class.where(user_id: pending_invite.id)).to be_empty
  end
end
