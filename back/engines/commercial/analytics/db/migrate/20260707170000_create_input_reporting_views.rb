# frozen_string_literal: true

# Third slice of the unified reporting model: the inputs fact and its
# satellites (tags, statuses, votes, reactions). Grants follow in a separate
# main-app migration.
class CreateInputReportingViews < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_inputs, version: 1
    create_view :reporting_input_tags, version: 1
    create_view :reporting_input_statuses, version: 1
    create_view :reporting_input_votes, version: 1
    create_view :reporting_input_reactions, version: 1
  end
end
