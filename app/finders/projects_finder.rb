# frozen_string_literal: true

## ProjectsFinder.find
class ProjectsFinder < ApplicationFinder
  default_sort :created_at
  sortable_attributes %w[]
  sort_scopes({})
end
