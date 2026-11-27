# frozen_string_literal: true

require 'rails_helper'

# The patch relies on ActiveJob internals (`Base.execute` and `#serialize`), so these specs
# guard it across Rails upgrades.
RSpec.describe MultiTenancy::Patches::ActiveJob::Base do
  let(:job_class) do
    Class.new(ApplicationJob) do
      def self.name = 'TenantProbeJob'

      def run
        self.class.observed_tenant = Apartment::Tenant.current
      end

      class << self
        attr_accessor :observed_tenant
      end
    end
  end

  before { stub_const('TenantProbeJob', job_class) }

  describe '#serialize' do
    it 'records the tenant the job was enqueued in' do
      expect(TenantProbeJob.new.serialize).to include('tenant_schema_name' => 'example_org')
    end

    it 'keeps the payload keys ActiveJob writes' do
      expect(TenantProbeJob.new.serialize.keys).to include('job_class', 'job_id', 'arguments', 'locale')
    end
  end

  describe '.execute' do
    it 'runs the job in the tenant recorded in the payload' do
      job_data = Apartment::Tenant.switch('public') { TenantProbeJob.new.serialize }

      ActiveJob::Base.execute(job_data)

      expect(TenantProbeJob.observed_tenant).to eq('public')
      expect(Apartment::Tenant.current).to eq('example_org')
    end

    it 'runs the job in the default schema when the payload has no tenant' do
      job_data = TenantProbeJob.new.serialize.except('tenant_schema_name')

      ActiveJob::Base.execute(job_data)

      expect(TenantProbeJob.observed_tenant).to eq('public')
    end
  end
end
