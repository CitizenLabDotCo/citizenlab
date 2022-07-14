# frozen_string_literal: true

BulkImportIdeas::Engine.routes.draw do
  nil
end

Rails.application.routes.draw do
  mount BulkImportIdeas::Engine => ''
end
