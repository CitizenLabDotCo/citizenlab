# frozen_string_literal: true

# Second slice of the unified reporting model: the contributions fact (one row
# per participatory action, all methods) and the participants view derived from
# it. reporting_participants selects from reporting_contributions, so creation
# order matters. Grants follow in a separate main-app migration.
class CreateContributionReportingViews < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_contributions, version: 1
    create_view :reporting_participants, version: 1
  end
end
