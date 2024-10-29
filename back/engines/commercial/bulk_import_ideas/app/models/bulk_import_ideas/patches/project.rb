module BulkImportIdeas::Patches::Project
  def self.included(base)
    base.class_eval do
      has_many :idea_import_files, class_name: 'BulkImportIdeas::IdeaImportFile', dependent: :destroy
    end
  end
end
