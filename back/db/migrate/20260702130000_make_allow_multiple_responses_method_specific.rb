# frozen_string_literal: true

# allow_multiple_responses is method-specific: ideation/proposals/voting
# historically allow posting multiple inputs (default true), native surveys are
# single-response by default (false), and community monitor ignores the flag
# (fixed 3-month cadence). The column is nullable with no database default so
# each participation method fills its own default on create/method change (see
# ParticipationMethod::Base#assign_defaults_for_phase implementations).
class MakeAllowMultipleResponsesMethodSpecific < ActiveRecord::Migration[7.2]
  def up
    change_column_default :phases, :allow_multiple_responses, from: false, to: nil
    change_column_null :phases, :allow_multiple_responses, true

    safety_assured do
      execute <<~SQL.squish
        UPDATE phases
        SET allow_multiple_responses = true
        WHERE participation_method IN ('ideation', 'proposals', 'voting')
      SQL
    end
  end

  def down
    safety_assured do
      execute <<~SQL.squish
        UPDATE phases
        SET allow_multiple_responses = false
        WHERE allow_multiple_responses IS NULL
      SQL
    end
    change_column_null :phases, :allow_multiple_responses, false
    change_column_default :phases, :allow_multiple_responses, from: nil, to: false
  end
end
