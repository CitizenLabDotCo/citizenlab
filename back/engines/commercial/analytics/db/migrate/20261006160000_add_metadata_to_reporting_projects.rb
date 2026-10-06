# frozen_string_literal: true

class AddMetadataToReportingProjects < ActiveRecord::Migration[7.2]
  def change
    replace_view :reporting_projects, version: 2, revert_to_version: 1
  end
end
