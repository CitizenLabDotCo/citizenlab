# frozen_string_literal: true

require 'rails_helper'

RSpec.describe McpServer::Tools::RunReportingSqlQuery do
  # Layer 2's restricted role is cluster-global; provision it idempotently for
  # every tenant so the tool can be exercised end-to-end (never drop it, since it
  # may be referenced by sibling databases on the same cluster).
  # rubocop:disable RSpec/BeforeAfterAll -- role is cluster-global; set up once.
  before(:all) do
    McpServer::AnalyticsReaderProvisioner.ensure_role!
    Apartment.tenant_names.each { |schema| McpServer::AnalyticsReaderProvisioner.grant!(schema) }
  end
  # rubocop:enable RSpec/BeforeAfterAll

  def run(query)
    described_class::Runner.new(
      params: { query: query },
      server_context: {},
      current_user: nil,
      token_scopes: []
    ).run
  end

  describe 'layer 2 (execution under the restricted role)' do
    it 'runs the query as the analytics_reader role' do
      response = run('SELECT current_user AS u')

      expect(response.error?).to be false
      expect(response.structured_content[:rows]).to eq([{ 'u' => 'analytics_reader' }])
      expect(response.structured_content[:truncated]).to be false
    end

    it 'reads the analytics fact view and returns columns + rows' do
      response = run('SELECT count(*) AS n FROM analytics_fact_participations')

      expect(response.error?).to be false
      expect(response.structured_content[:columns]).to eq(['n'])
      expect(response.structured_content[:row_count]).to eq(1)
    end
  end

  describe 'layer 1 (sandbox) rejections' do
    it 'rejects a blank query before touching the database' do
      response = run('   ')

      expect(response.error?).to be true
      expect(response.content.first[:text]).to match(/non-empty/)
    end

    it 'rejects a non-whitelisted table with an actionable reason' do
      response = run('SELECT * FROM users')

      expect(response.error?).to be true
      expect(response.content.first[:text]).to match(/Query rejected/).and match(/not queryable/)
    end

    it 'rejects a cross-tenant schema-qualified reference' do
      response = run('SELECT * FROM other_tenant.analytics_fact_participations')

      expect(response.error?).to be true
      expect(response.content.first[:text]).to match(/Query rejected/).and match(/Schema-qualified/)
    end
  end
end
