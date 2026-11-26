# frozen_string_literal: true

module ContentBuilder
  # Running a reporting query the LLM wrote. Headless: there is no record, the
  # question is only who may read reporting data at all.
  #
  # Admins and moderators. Which rows a query reads is not decided here: it runs
  # with the asker's McpServer::QueryScope, so a moderator reads the projects they
  # moderate and nothing else. Residents and visitors never query: a published
  # report serves them from stored results.
  class ReportingQueryPolicy < ApplicationPolicy
    def create?
      AppConfiguration.instance.feature_activated?('llm_reporting') && active_admin_or_moderator?
    end
  end
end
