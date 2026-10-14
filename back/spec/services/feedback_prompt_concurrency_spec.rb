# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FeedbackPromptService do
  # Separate connections must see committed fixtures to exercise row locking.
  self.use_transactional_tests = false

  let(:user) { create(:admin) }

  before { user }
  after { user.destroy! }

  def concurrently
    tenant = Apartment::Tenant.current
    user_id = user.id
    ready = Queue.new
    start = Queue.new
    threads = Array.new(2) do
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          Apartment::Tenant.switch(tenant) do
            ready << true
            start.pop
            yield User.find(user_id)
          end
        end
      end
    end
    2.times { ready.pop }
    2.times { start << true }
    threads.map(&:value)
  end

  it 'queues only one returning-user prompt' do
    results = concurrently { |owner| described_class.new.enqueue(owner, 'return_findability') }
    expect(results.compact.size).to eq 1
    expect(user.feedback_prompts.pending.count).to eq 1
  end

  it 'shows a queued prompt to only one caller' do
    create(:feedback_prompt, user: user)
    results = concurrently do |owner|
      described_class.new.show_next(owner, trigger: 'save', ui_version: 'project_backoffice_v1',
        admin_area: '/:locale/admin/projects/:projectId/general')
    end
    expect(results.compact.size).to eq 1
    expect(user.feedback_prompts.sole.status).to eq 'shown'
  end
end
