# frozen_string_literal: true

# The UI toggle to disable submissions on native survey phases was removed, so
# existing phases that were left disabled can no longer be re-enabled. Native
# surveys must always accept submissions, so backfill any that are still off.
# (Community monitor surveys intentionally keep submission_enabled = false and
# use a different participation method, so they are not affected.)
class EnableSubmissionForNativeSurveyPhases < ActiveRecord::Migration[7.2]
  def up
    # Strong Migrations can't inspect raw SQL; this is a plain conditional data
    # backfill on one column, so it is safe.
    safety_assured do
      execute <<~SQL.squish
        UPDATE phases
        SET submission_enabled = true
        WHERE participation_method = 'native_survey'
          AND submission_enabled IS NOT TRUE
      SQL
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
