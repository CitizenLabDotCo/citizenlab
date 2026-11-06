# frozen_string_literal: true

module Analytics
  module Reporting
    # A view the LLM can query. Each one says which of its rows belong to a set of
    # projects, or is admin only. A query limited to a project reads each view
    # through this rule, so the rule is what "this project's rows" means for that
    # view.
    module ScopedView
      extend ActiveSupport::Concern

      class_methods do
        # Each view overrides this with its rule, returning a relation with only
        # the rows that belong to these projects. This default raises, so a view
        # without a rule fails closed.
        def for_projects(_project_ids)
          raise NotImplementedError, "#{name} has no project scope rule"
        end

        # An admin-only view can be read only by a query over every row (an
        # admin's); any query limited to some projects cannot use it.
        def admin_only? = false
      end
    end
  end
end
