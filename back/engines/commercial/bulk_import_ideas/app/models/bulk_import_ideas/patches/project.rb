module BulkImportIdeas::Patches::Project
  def self.included(base)
    base.class_eval do
      has_many :idea_import_files, class_name: 'BulkImportIdeas::IdeaImportFile', dependent: :destroy
      has_one :project_import, class_name: 'BulkImportIdeas::ProjectImport', dependent: :nullify
    end
  end
end
