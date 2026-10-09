# frozen_string_literal: true

require 'rails_helper'

# The R-score recipe in the view's description must give the same score as the
# representativeness dashboard (UserCustomFields::Representativeness::RScore).
RSpec.describe 'reporting_reference_distributions parity with the representativeness R-score' do # rubocop:disable RSpec/DescribeClass
  # Follows the recipe in Analytics::Reporting::ReferenceDistribution.table_description.
  def recipe_rscore(question_key, answers_sql)
    sql = <<~SQL.squish
      SELECT MIN(rate) / MAX(rate) AS rscore
      FROM (
        SELECT COUNT(u.user_id)::numeric / d.population_count AS rate
        FROM reporting_reference_distributions d
        LEFT JOIN (#{answers_sql}) u ON #{yield}
        WHERE d.question_key = '#{question_key}'
        GROUP BY d.id, d.population_count
      ) rates
    SQL
    ActiveRecord::Base.connection.select_value(sql).to_f
  end

  it 'gives the dashboard R-score for a categorical distribution' do
    gender = create(:custom_field_gender, :with_options)
    male, female = %w[male female].map { |key| gender.options.find_by!(key: key) }
    distribution = create(:categorical_distribution, custom_field: gender, distribution: { male.id => 480, female.id => 520 })
    # 'unspecified' has no base data, so both scores leave those users out.
    { 'male' => 3, 'female' => 1, 'unspecified' => 2 }.each do |value, count|
      create_list(:user, count) { |user| user.custom_field_answers.create!(key: 'gender', value: value) }
    end

    rscore = recipe_rscore('gender', 'SELECT user_id, question_id, answer_value FROM reporting_user_question_answers') do
      'u.question_id = d.question_id AND u.answer_value = d.answer_value'
    end

    expect(rscore).to be_within(0.0001).of(distribution.compute_rscore(User.all).value)
  end

  it 'gives the dashboard R-score for an age distribution' do
    distribution = create(:binned_distribution, bins: [nil, 25, 50, nil], counts: [30, 40, 30])
    [1990, 1990, 1960, 1960, 1960, 1940, Time.zone.today.year - 10].each do |year|
      create(:user).custom_field_answers.create!(key: 'birthyear', value: year)
    end

    age = Analytics::Reporting::ReferenceDistribution::AGE_SQL
    ages_sql = <<~SQL.squish
      SELECT user_id, #{age} AS age
      FROM reporting_user_question_answers
      WHERE question_key = 'birthyear' AND answer_value ~ '^[0-9]+$'
    SQL
    rscore = recipe_rscore('birthyear', ages_sql) do
      'u.age >= d.min_age AND (d.max_age IS NULL OR u.age < d.max_age)'
    end

    expect(rscore).to be_within(0.0001).of(distribution.compute_rscore(User.all).value)
  end
end
