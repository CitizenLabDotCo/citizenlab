# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::ReferenceDistribution do
  it 'exposes one row per option of a categorical distribution, keyed like the user answers' do
    gender = create(:custom_field_gender, :with_options)
    male, female = %w[male female].map { |key| gender.options.find_by!(key: key) }
    create(:categorical_distribution, custom_field: gender, distribution: { male.id => 480, female.id => 520 })

    rows = described_class.where(question_id: gender.id)

    expect(rows.map { |row| [row.question_key, row.answer_value, row.answer_label, row.population_count] })
      .to contain_exactly(['gender', 'male', 'Male', 480], ['gender', 'female', 'Female', 520])
  end

  it 'only exposes the distribution the dashboard uses, CustomField#current_ref_distribution' do
    gender = create(:custom_field_gender, :with_options)
    male, female = %w[male female].map { |key| gender.options.find_by!(key: key) }
    create(:categorical_distribution, custom_field: gender, distribution: { male.id => 1, female.id => 1 }, created_at: 1.year.ago)
    # Validation allows one distribution per question, but no constraint enforces it.
    build(:categorical_distribution, custom_field: gender, distribution: { male.id => 480, female.id => 520 })
      .save!(validate: false)
    view_distribution_ids = described_class.where(question_id: gender.id).map { |row| row.id.split(':').first }.uniq
    dashboard_distribution_id = gender.reload.current_ref_distribution.id

    expect(view_distribution_ids).to eq [dashboard_distribution_id]
  end

  it 'leaves out the base data of disabled questions' do
    gender = create(:custom_field_gender, :with_options, enabled: false)
    male, female = %w[male female].map { |key| gender.options.find_by!(key: key) }
    create(:categorical_distribution, custom_field: gender, distribution: { male.id => 480, female.id => 520 })

    expect(described_class.where(question_id: gender.id)).to be_empty
  end

  it 'uses area ids and outside as the domicile answer values' do
    domicile = create(:custom_field_domicile)
    area = create(:area, title_multiloc: { 'en' => 'North' })
    outside = create(:custom_field_option, custom_field: domicile, key: 'somewhere_else', title_multiloc: { 'en' => 'Somewhere else' })
    create(:categorical_distribution, custom_field: domicile, distribution: { area.custom_field_option_id => 70, outside.id => 30 })

    rows = described_class.where(question_id: domicile.id)

    expect(rows.map { |row| [row.answer_value, row.answer_label, row.population_count] })
      .to contain_exactly([area.id, 'North', 70], ['outside', 'Somewhere else', 30])
  end

  it 'joins domicile rows to the user answers on question_id and answer_value' do
    domicile = create(:custom_field_domicile)
    area = create(:area)
    outside = create(:custom_field_option, custom_field: domicile, key: 'somewhere_else')
    create(:categorical_distribution, custom_field: domicile, distribution: { area.custom_field_option_id => 70, outside.id => 30 })
    [area.id, area.id, 'outside'].each { |value| create(:user).custom_field_answers.create!(key: 'domicile', value: value) }

    users_per_row = described_class.where(question_id: domicile.id)
      .joins(<<~SQL.squish)
        INNER JOIN reporting_user_question_answers u
          ON u.question_id = reporting_reference_distributions.question_id
          AND u.answer_value = reporting_reference_distributions.answer_value
      SQL
      .group(:answer_value).count

    expect(users_per_row).to eq(area.id => 2, 'outside' => 1)
  end

  it 'exposes one row per age group of a binned distribution' do
    distribution = create(:binned_distribution, bins: [nil, 18, 65, nil], counts: [20, 50, 30])

    rows = described_class.where(question_id: distribution.custom_field_id).order(:min_age)

    expect(rows.map { |row| [row.question_key, row.min_age, row.max_age, row.population_count, row.answer_value] })
      .to eq [['birthyear', 0, 18, 20, nil], ['birthyear', 18, 65, 50, nil], ['birthyear', 65, nil, 30, nil]]
  end
end
