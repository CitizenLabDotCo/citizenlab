# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::UserQuestionAnswer do
  it 'exposes select answers with their question metadata' do
    field = create(:custom_field_gender, :with_options)
    user = create(:user, custom_field_answers: [build(:custom_field_answer, key: 'gender', value: 'male')])
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
    user.custom_field_answers.create!(key: field.key, value: %w[option1 option2])

    expect(described_class.where(user_id: user.id).pluck(:answer_value)).to match_array %w[option1 option2]
  end

  it 'labels single-select answers with the option title' do
    gender = create(:custom_field_gender)
    create(:custom_field_option, custom_field: gender, key: 'female', title_multiloc: { 'en' => 'Woman' })
    user = create(:user, custom_field_answers: [build(:custom_field_answer, key: 'gender', value: 'female')])

    expect(described_class.find_by!(user_id: user.id).answer_label).to eq 'Woman'
  end

  it 'labels multi-select answers with the option title' do
    race = create(:custom_field_multiselect)
    create(:custom_field_option, custom_field: race, key: 'race_1', title_multiloc: { 'en' => 'Black or African American' })
    user = create(:user)
    user.custom_field_answers.create!(key: race.key, value: %w[race_1])

    expect(described_class.find_by!(user_id: user.id).answer_label).to eq 'Black or African American'
  end

  it 'labels domicile answers with the area title' do
    domicile = create(:custom_field_domicile)
    area = create(:area, title_multiloc: { 'en' => 'North Ward' })
    create(:custom_field_option, custom_field: domicile, key: 'somewhere_else', title_multiloc: { 'en' => 'Somewhere else' })
    in_area = create(:user)
    in_area.custom_field_answers.create!(key: 'domicile', value: area.id)
    outside = create(:user)
    outside.custom_field_answers.create!(key: 'domicile', value: 'outside')

    expect(described_class.find_by!(user_id: in_area.id).answer_label).to eq 'North Ward'
    expect(described_class.find_by!(user_id: outside.id).answer_label).to eq 'Somewhere else'
  end

  it 'exposes number answers like birthyear as text' do
    create(:custom_field_birthyear)
    user = create(:user)
    user.custom_field_answers.create!(key: 'birthyear', value: 1990)

    expect(described_class.find_by!(user_id: user.id).answer_value).to eq '1990'
  end

  it 'has no rows for unanswered questions or disabled fields' do
    create(:custom_field_gender, :with_options, enabled: false)
    unanswered = create(:user)
    answered_disabled = create(:user)
    answered_disabled.custom_field_answers.create!(key: 'gender', value: 'male')

    expect(described_class.where(user_id: [unanswered.id, answered_disabled.id])).to be_empty
  end

  it 'has no rows for users excluded from reporting_users' do
    create(:custom_field_gender, :with_options)
    pending_invite = create(:user, invite_status: 'pending', registration_completed_at: nil)
    pending_invite.custom_field_answers.create!(key: 'gender', value: 'male')

    expect(described_class.where(user_id: pending_invite.id)).to be_empty
  end
end
