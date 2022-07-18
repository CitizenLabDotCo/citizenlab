# frozen_string_literal: true

module BulkImportIdeas
  class ImportIdeasPolicy < ApplicationPolicy
    def bulk_create_xlsx?
      user&.active? && user&.admin?
    end

    def example_xlsx?
      user&.active? && user&.admin?
    end
  end
end
