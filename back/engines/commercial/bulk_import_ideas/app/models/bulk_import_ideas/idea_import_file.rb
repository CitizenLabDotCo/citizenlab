# frozen_string_literal: true

# == Schema Information
#
# Table name: idea_import_files
#
#  id          :uuid             not null, primary key
#  project_id  :uuid
#  file        :string
#  name        :string
#  import_type :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  num_pages   :integer          default(0)
#
# Indexes
#
#  index_idea_import_files_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#
module BulkImportIdeas
  class IdeaImportFile < ApplicationRecord
    self.table_name = 'idea_import_files'

    attr_accessor :filename

    mount_base64_file_uploader :file, IdeaImportFileUploader

    belongs_to :project, optional: true

    validates :name, presence: true
    validates :file, presence: true, unless: proc { Current.loading_tenant_template }
  end
end
