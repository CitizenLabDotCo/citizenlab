# frozen_string_literal: true

module BulkImportIdeas
  class IdeaImport < ApplicationRecord
    self.table_name = 'idea_imports'

    belongs_to :idea
    belongs_to :import_user, class_name: 'User', optional: true

    # TODO: Patch idea

  end
end
