module BulkImportIdeas::Patches::User
  def self.included(base)
    base.class_eval do
      has_many :idea_imports, class_name: 'BulkImportIdeas::IdeaImport', foreign_key: :import_user_id, dependent: :nullify
      has_many :project_imports, class_name: 'BulkImportIdeas::ProjectImport', foreign_key: :import_user_id, dependent: :nullify
    end
  end
end