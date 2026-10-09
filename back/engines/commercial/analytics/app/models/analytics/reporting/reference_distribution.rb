# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_reference_distributions
#
#  id               :text             primary key
#  question_id      :uuid
#  question_key     :string
#  answer_value     :string
#  answer_label     :text
#  min_age          :integer
#  max_age          :integer
#  population_count :integer
#  updated_at       :datetime
#
module Analytics
  module Reporting
    class ReferenceDistribution < Analytics::ApplicationRecordView
      self.table_name = 'reporting_reference_distributions'
      self.primary_key = :id

      # How the representativeness dashboard computes a user's age
      # (UserCustomFields::AgeCounter#convert_to_age): years since 1 July of
      # the birth year, counting a year as 365.2425 days. Anything but a
      # four-digit year gives NULL (unknown age) instead of failing the whole
      # query on a cast or date error. The product also treats non-numbers as
      # unknown, but turns an invalid number like 0 into a huge age; valid
      # answers are 1900 to last year, so only old, unvalidated data differs.
      AGE_SQL = <<~SQL.squish
        CASE WHEN answer_value ~ '^[0-9]{4}$' THEN
          GREATEST(EXTRACT(EPOCH FROM now() - make_date(answer_value::integer, 7, 1)) / 31556952, 0)
        END
      SQL

      def self.table_description
        <<~DOC.squish
          The population base data (census figures) administrators uploaded for
          the representativeness dashboard: one row per option of a select
          registration question, or per age group for 'birthyear'. Compare it
          with reporting_user_question_answers to tell how representative
          participants are. Empty for a question when no base data was
          uploaded: then say so and suggest uploading it, rather than looking
          up census figures. Representativeness score (R-score) as the
          dashboard computes it: count the compared users per row, divide by
          population_count to get a participation rate, and take the lowest
          rate divided by the highest. A row without users gives a rate of 0,
          and users whose answer has no row are left out. For age, put each
          user in the row where min_age <= age and (max_age IS NULL or
          age < max_age), with age = #{AGE_SQL} on the user's 'birthyear'
          answer_value. Use it exactly as given: it returns NULL for a
          malformed year, which then matches no row, like an unknown age on
          the dashboard.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'question_id' => 'The registration question the base data is for. Joins reporting_user_question_answers.question_id.',
          'question_key' => "Stable machine key of the question, for example 'gender', 'birthyear' or 'domicile'.",
          'answer_value' => <<~DOC.squish,
            The option, in the same form as reporting_user_question_answers.answer_value
            (for 'domicile' an area id, or 'outside'), so join on question_id and
            answer_value. NULL for age groups.
          DOC
          'answer_label' => 'The option as users see it, resolved to the platform primary locale. NULL for age groups.',
          'min_age' => 'For age groups: the lowest age in the group, inclusive. NULL for options.',
          'max_age' => 'For age groups: the age where the group ends, exclusive; NULL for the open-ended last group and for options.',
          'population_count' => 'Number of people in the population with this answer. Only the proportions between rows matter.',
          'updated_at' => 'When the base data was last uploaded or changed (UTC). Mention its age in reports, as census figures go out of date.'
        }
      end

      def self.foreign_keys
        {}
      end
    end
  end
end
