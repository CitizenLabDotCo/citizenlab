# frozen_string_literal: true

require 'rails_helper'

# Unit spec for the shared reporting-query runner. Layer 1's own red-team coverage
# lives in sql_sandboxer_spec; what matters here is the contract every caller leans
# on: what `run` hands back, what `validate!` refuses, and the fact that the query
# really does execute as the restricted role rather than as the app.
RSpec.describe McpServer::ReportingQueryRunner do
  # The role is cluster-global; provision it idempotently so the query can be run
  # end-to-end (never drop it, since sibling databases on the cluster may use it).
  # rubocop:disable RSpec/BeforeAfterAll -- role is cluster-global; set up once.
  before(:all) do
    McpServer::AnalyticsReaderProvisioner.ensure_role!
    Apartment.tenant_names.each { |schema| McpServer::AnalyticsReaderProvisioner.grant!(schema) }
  end
  # rubocop:enable RSpec/BeforeAfterAll

  describe '.validate!' do
    it 'returns the normalized SQL' do
      expect(described_class.validate!('select   count(*)  from reporting_contributions'))
        .to eq('SELECT count(*) FROM reporting_contributions')
    end

    it 'rejects a blank query before touching the database' do
      expect { described_class.validate!('   ') }
        .to raise_error(described_class::Rejected, /non-empty/)
    end

    it 'rejects a query the sandbox refuses, keeping the reason the model can act on' do
      expect { described_class.validate!('SELECT * FROM users') }
        .to raise_error(described_class::Rejected, /Query rejected/)
    end
  end

  describe '.run' do
    it 'returns the columns and rows of the query' do
      result = described_class.run('SELECT count(*) AS n FROM reporting_contributions', scope: McpServer::QueryScope.all)

      expect(result.columns).to eq(['n'])
      expect(result.rows.size).to eq(1)
      expect(result.truncated).to be false
    end

    it 'runs as the analytics_reader role, not as the application user' do
      result = described_class.run('SELECT current_user AS u', scope: McpServer::QueryScope.all)

      expect(result.rows).to eq([{ 'u' => 'analytics_reader' }])
    end

    # The row cap is what keeps a careless query from pulling a whole table into
    # memory, and `truncated` is how a caller knows it is looking at a prefix.
    it 'caps the rows at ROW_LIMIT and says that it truncated' do
      stub_const("#{described_class}::ROW_LIMIT", 2)

      result = described_class.run('SELECT unnest(ARRAY[1, 2, 3]) AS n', scope: McpServer::QueryScope.all)

      expect(result.rows.size).to eq(2)
      expect(result.truncated).to be true
    end

    it 'does not claim truncation when the rows exactly fill the cap' do
      stub_const("#{described_class}::ROW_LIMIT", 3)

      result = described_class.run('SELECT unnest(ARRAY[1, 2, 3]) AS n', scope: McpServer::QueryScope.all)

      expect(result.rows.size).to eq(3)
      expect(result.truncated).to be false
    end

    # SET LOCAL is scoped to the outermost transaction, so a caller that wraps the run
    # in one of its own would otherwise keep the restricted role and the timeouts for
    # everything it did afterwards.
    it 'leaves the connection unrestricted for a caller that wrapped it in a transaction' do
      ActiveRecord::Base.transaction do
        described_class.run('SELECT 1 AS n', scope: McpServer::QueryScope.all)

        expect(ActiveRecord::Base.connection.select_value('SELECT current_user'))
          .not_to eq(described_class::ANALYTICS_READER_ROLE)
      end
    end

    it 'raises rather than returning a result when there is no tenant to run in' do
      expect do
        Apartment::Tenant.switch('public') do
          described_class.run('SELECT count(*) AS n FROM reporting_contributions', scope: McpServer::QueryScope.all)
        end
      end.to raise_error(/No tenant context/)
    end
  end

  describe '.run with a project scope' do
    let!(:mine) { create_reporting_rows }
    let(:scope) { McpServer::QueryScope.new(project_ids: [mine.id]) }

    before { create_reporting_rows }

    def count(view, scope)
      described_class.run("SELECT count(*) AS n FROM #{view}", scope: scope).rows.first['n']
    end

    # One project's rows through the wrapper must be exactly the rows its rule keeps,
    # for every view a scoped query may read.
    McpServer::Tools::GetReportingSqlSchema.tables_for(McpServer::QueryScope.new(project_ids: [])).each do |model|
      it "reads the rows of #{model.table_name} that the view's rule keeps" do
        expect(count(model.table_name, scope)).to eq model.for_projects([mine.id]).count
      end

      next if model == Analytics::Reporting::ReferenceDistribution

      it "reads no rows of #{model.table_name} for an empty scope" do
        expect(count(model.table_name, McpServer::QueryScope.new(project_ids: []))).to eq 0
      end
    end

    it 'refuses an admin-only view' do
      expect { described_class.run('SELECT count(*) FROM reporting_staff_activities', scope: scope) }
        .to raise_error(described_class::Rejected, /reporting_staff_activities/)
    end

    it 'keeps the scope inside a CTE that reuses a view name' do
      sql = 'WITH reporting_inputs AS (SELECT * FROM reporting_inputs) SELECT DISTINCT project_id FROM reporting_inputs'

      expect(described_class.run(sql, scope: scope).rows).to eq([{ 'project_id' => mine.id }])
    end

    it 'keeps the scope inside a subquery' do
      sql = 'SELECT DISTINCT project_id FROM (SELECT project_id FROM reporting_inputs) inputs'

      expect(described_class.run(sql, scope: scope).rows).to eq([{ 'project_id' => mine.id }])
    end
  end
end
