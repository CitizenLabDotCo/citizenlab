# frozen_string_literal: true

# == Schema Information
#
# Table name: project_imports
#
#  id             :uuid             not null, primary key
#  project_id     :uuid
#  import_user_id :uuid
#  import_id      :uuid
#  log            :string           default([]), is an Array
#  locale         :string
#  string         :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_project_imports_on_import_user_id  (import_user_id)
#  index_project_imports_on_project_id      (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (import_user_id => users.id)
#  fk_rails_...  (project_id => projects.id)
#
module BulkImportIdeas
  class ProjectImport < ApplicationRecord
    self.table_name = 'project_imports'

    belongs_to :project
    belongs_to :import_user, class_name: 'User', optional: true
  end
end
