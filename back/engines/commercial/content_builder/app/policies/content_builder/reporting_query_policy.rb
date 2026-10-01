# frozen_string_literal: true

module ContentBuilder
  # Running a reporting query the LLM wrote. Headless: there is no record, the
  # question is only who may read the platform's reporting data.
  #
  # Admin-only for now. The queries run under a read-only Postgres role over the
  # curated reporting views, but they are still arbitrary SQL over participation
  # data, and a published report serves visitors from stored results rather than
  # by letting them query.
  class ReportingQueryPolicy < ApplicationPolicy
    def create?
      CustomBlockPolicy.feature_activated? && active? && admin?
    end
  end
end
