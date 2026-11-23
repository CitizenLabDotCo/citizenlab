# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LocalProjectCopyService do
  # Separate connections must see committed records to exercise the lock.
  self.use_transactional_tests = false

  let(:source_project) { create(:project, title_multiloc: { en: 'Copy me' }, slug: 'copy-me') }

  before { source_project }
  after { Project.destroy_all }

  def concurrently(count)
    tenant = Apartment::Tenant.current
    project_id = source_project.id
    ready = Queue.new
    start = Queue.new
    threads = Array.new(count) do
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          Apartment::Tenant.switch(tenant) do
            ready << true
            start.pop
            yield Project.find(project_id)
          end
        end
      end
    end
    count.times { ready.pop }
    count.times { start << true }
    threads.map(&:value)
  end

  it 'gives each concurrent copy of a project its own slug' do
    copies = concurrently(2) { |project| described_class.new.copy(project) }
    expect(copies.map(&:slug)).to contain_exactly('copy-me-copy', 'copy-me-copy-1')
  end
end
