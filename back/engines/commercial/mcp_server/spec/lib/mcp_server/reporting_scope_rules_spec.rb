# frozen_string_literal: true

require 'rails_helper'

# Every reporting view must say how a moderator's query is limited to their
# projects, or be admin only. A view with neither cannot be queried with a project
# scope, so a new view fails here before it fails for a moderator.
RSpec.describe 'Reporting scope rules' do # rubocop:disable RSpec/DescribeClass
  McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.each do |model|
    describe model.name do
      it 'has a project scope rule, or is admin only' do
        expect(model).to include(Analytics::Reporting::ScopedView)
        expect { model.for_projects([]).to_sql }.not_to raise_error unless model.admin_only?
      end
    end
  end

  it 'makes only the views without a project admin only' do
    admin_only = McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.select(&:admin_only?)

    expect(admin_only.map(&:table_name))
      .to match_array %w[reporting_staff_activities reporting_invites reporting_registrations]
  end

  describe 'a view without a rule' do
    # A named model, removed afterwards, as in plain_text_multiloc_spec: an anonymous
    # model stays in ActiveRecord::Base.descendants, where code that lists every model
    # (Cl2DataListingService) fails on its blank name. It reads a real view, which that
    # listing skips, in case the class outlives the constant.
    # These disabled RuboCop rules are necessary to permit the successful creation and
    # removal of a dynamic class, the leakage of which is what the rubocop rules are
    # trying to prevent.
    before(:context) do # rubocop:disable RSpec/BeforeAfterAll
      Object.const_set(:TempUnscopedReportingView, Class.new(Analytics::ApplicationRecordView) do
        self.table_name = 'reporting_projects'
        include Analytics::Reporting::ScopedView
      end)
    end

    after(:context) do # rubocop:disable RSpec/BeforeAfterAll
      # rubocop:disable RSpec/RemoveConst
      Object.send(:remove_const, :TempUnscopedReportingView) if Object.const_defined?(:TempUnscopedReportingView)
      # rubocop:enable RSpec/RemoveConst
    end

    it 'fails closed' do
      expect { TempUnscopedReportingView.for_projects([]) }.to raise_error(NotImplementedError)
    end
  end
end
