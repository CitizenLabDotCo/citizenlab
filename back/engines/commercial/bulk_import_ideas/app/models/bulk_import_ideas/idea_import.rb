# frozen_string_literal: true

# == Schema Information
#
# Table name: idea_imports
#
#  id              :uuid             not null, primary key
#  idea_id         :uuid
#  import_user_id  :uuid
#  file_id         :uuid
#  user_created    :boolean          default(FALSE)
#  approved_at     :datetime
#  page_range      :text             default([]), is an Array
#  locale          :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  user_consent    :boolean
#  content_changes :jsonb
#
# Indexes
#
#  index_idea_imports_on_file_id         (file_id)
#  index_idea_imports_on_idea_id         (idea_id)
#  index_idea_imports_on_import_user_id  (import_user_id)
#
# Foreign Keys
#
#  fk_rails_...  (file_id => idea_import_files.id)
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (import_user_id => users.id)
#
module BulkImportIdeas
  class IdeaImport < ApplicationRecord
    self.table_name = 'idea_imports'

    belongs_to :file, class_name: 'BulkImportIdeas::IdeaImportFile', optional: true
    belongs_to :idea
    belongs_to :import_user, class_name: 'User', optional: true
  end
end
