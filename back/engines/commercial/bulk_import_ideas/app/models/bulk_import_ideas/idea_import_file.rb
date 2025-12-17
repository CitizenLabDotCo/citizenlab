# frozen_string_literal: true

# == Schema Information
#
# Table name: idea_import_files
#
#  id           :uuid             not null, primary key
#  project_id   :uuid
#  file         :string
#  name         :string
#  import_type  :string
#  num_pages    :integer          default(0)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  parent_id    :uuid
#  parsed_value :jsonb
#
# Indexes
#
#  index_idea_import_files_on_parent_id   (parent_id)
#  index_idea_import_files_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => idea_import_files.id)
#  fk_rails_...  (project_id => projects.id)
#
module BulkImportIdeas
  class IdeaImportFile < ApplicationRecord
    self.table_name = 'idea_import_files'

    attr_accessor :filename

    mount_base64_file_uploader :file, IdeaImportFileUploader

    belongs_to :project, optional: true

    belongs_to :parent, class_name: 'BulkImportIdeas::IdeaImportFile', optional: true
    has_many :children, class_name: 'BulkImportIdeas::IdeaImportFile', foreign_key: 'parent_id', dependent: :destroy

    validates :name, presence: true
    validates :file, presence: true, unless: proc { Current.loading_tenant_template }

    # Hack to enable files to be opened on test
    def file_content_url
      file.url.include?('http') ? file.url : file.file.file
    end
  end
end
