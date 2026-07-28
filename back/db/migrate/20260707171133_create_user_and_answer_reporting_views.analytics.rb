# frozen_string_literal: true

# This migration comes from analytics (originally 20260707180000)
# Fourth slice of the unified reporting model: active users (without PII) and
# the exploded question answers for users (demographics) and inputs (survey
# and idea-form answers). reporting_user_question_answers selects from
# reporting_users, so creation order matters. Grants follow in a separate
# main-app migration.
class CreateUserAndAnswerReportingViews < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_users, version: 1
    create_view :reporting_user_question_answers, version: 1
    create_view :reporting_input_question_answers, version: 1
  end
end
