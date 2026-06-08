# frozen_string_literal: true

require 'rails_helper'

# The analytics_reader role is cluster-global and shared across the dev/test
# databases on the same Postgres cluster, so these specs treat it as an
# idempotently-provisioned shared resource: they provision (never drop) and
# assert the resulting grant state via the privilege inspection functions, which
# need no role switch. Live execution under the role is covered end-to-end in the
# run_reporting_sql_query spec.
RSpec.describe McpServer::AnalyticsReaderProvisioner do
  subject(:conn) { ActiveRecord::Base.connection }

  let(:schema) { Apartment::Tenant.current }

  def can_select?(relation)
    conn.select_value(
      "SELECT has_table_privilege('analytics_reader', #{conn.quote("#{schema}.#{relation}")}, 'SELECT')"
    )
  end

  describe '.provision!' do
    before { described_class.provision!(schema) }

    it 'creates the analytics_reader role as NOLOGIN' do
      expect(described_class.role_exists?).to be true
      expect(conn.select_value("SELECT rolcanlogin FROM pg_roles WHERE rolname = 'analytics_reader'")).to be false
    end

    it 'lets the app login role assume it via SET ROLE' do
      expect(conn.select_value("SELECT pg_has_role(current_user, 'analytics_reader', 'MEMBER')")).to be true
    end

    it 'grants USAGE on the tenant schema' do
      expect(conn.select_value("SELECT has_schema_privilege('analytics_reader', #{conn.quote(schema)}, 'USAGE')"))
        .to be true
    end

    it 'grants SELECT on every reporting table' do
      McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.each do |table|
        expect(can_select?(table)).to be(true), "expected analytics_reader to read #{table}"
      end
    end

    it 'does NOT grant access to non-reporting tables (tight scope)' do
      expect(can_select?('users')).to be false
    end

    it 'is idempotent' do
      expect { described_class.provision!(schema) }.not_to raise_error
    end
  end

  describe '.provision_safely' do
    it 'swallows failures and returns false so tenant creation is never broken' do
      allow(described_class).to receive(:provision!).and_raise(ActiveRecord::StatementInvalid, 'no CREATEROLE')
      expect(described_class.provision_safely(schema)).to be false
    end

    it 'returns true on success' do
      expect(described_class.provision_safely(schema)).to be true
    end
  end

  describe '.drop_role!' do
    it 'is a guarded no-op when the role is absent' do
      allow(described_class).to receive(:role_exists?).and_return(false)
      expect(described_class).not_to receive(:execute)
      expect { described_class.drop_role! }.not_to raise_error
    end
  end
end
