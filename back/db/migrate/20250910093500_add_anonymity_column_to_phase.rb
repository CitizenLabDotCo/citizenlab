# frozen_string_literal: true

class AddAnonymityColumnToPhase < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :anonymity, :string, default: 'collect_all_data_available', null: false

    reversible do |dir|
      dir.up do
        Phase.reset_column_information

        # Native survey phases that had allow_anonymous_participation = true,
        # and user_fields_in_form = false, were effectively working as fully anonymous surveys.
        Phase
          .where(participation_method: 'native_survey')
          .where(allow_anonymous_participation: true)
          .where(user_fields_in_form: false)
          .update_all(anonymity: 'full_anonymity')

        # While native survey phases that had allow_anonymous_participation = true,
        # and user_fields_in_form = true, were still collecting demographic data.
        Phase
          .where(participation_method: 'native_survey')
          .where(allow_anonymous_participation: true)
          .where(user_fields_in_form: true)
          .update_all(anonymity: 'demographics_only')
      end
    end
  end
end
