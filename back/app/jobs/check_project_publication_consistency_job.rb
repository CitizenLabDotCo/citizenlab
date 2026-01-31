# frozen_string_literal: true

class CheckProjectPublicationConsistencyJob < ApplicationJob
  queue_as :default

  def perform
    # Directly call the controller method for consistency check
    WebApi::V1::ProjectsController.new.check_publication_inconsistencies!
  end
end
