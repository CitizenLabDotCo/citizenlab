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

  it 'only exposes the latest distribution of a question' do
    gender = create(:custom_field_gender, :with_options)
    male, female = %w[male female].map { |key| gender.options.find_by!(key: key) }
    create(:categorical_distribution, custom_field: gender, distribution: { male.id => 1, female.id => 1 }, created_at: 1.year.ago)
    # Validation allows one distribution per question, but no constraint enforces it.
    build(:categorical_distribution, custom_field: gender, distribution: { male.id => 480, female.id => 520 })
      .save!(validate: false)

    expect(described_class.where(question_id: gender.id).pluck(:population_count)).to contain_exactly(480, 520)
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

  it 'exposes one row per age group of a binned distribution' do
    distribution = create(:binned_distribution, bins: [nil, 18, 65, nil], counts: [20, 50, 30])

    rows = described_class.where(question_id: distribution.custom_field_id).order(:min_age)

    expect(rows.map { |row| [row.question_key, row.min_age, row.max_age, row.population_count, row.answer_value] })
      .to eq [['birthyear', 0, 18, 20, nil], ['birthyear', 18, 65, 50, nil], ['birthyear', 65, nil, 30, nil]]
  end
end
