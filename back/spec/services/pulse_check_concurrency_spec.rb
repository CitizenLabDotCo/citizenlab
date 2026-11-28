# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PulseCheckService do
  # Separate connections must see committed fixtures to exercise row locking.
  self.use_transactional_tests = false

  let(:user) { create(:admin) }

  before { user }
  after { user.destroy! }

  it 'queues only one returning-user pulse check' do
    user_id = user.id
    results = concurrently { described_class.new.enqueue(User.find(user_id), 'return_findability') }
    expect(results.compact.size).to eq 1
    expect(user.pulse_checks.pending.count).to eq 1
  end

  it 'shows a queued pulse check to only one caller' do
    create(:pulse_check, user: user)
    user_id = user.id
    results = concurrently do
      described_class.new.show_next(User.find(user_id), trigger: 'save', ui_version: 'project_backoffice_v1',
        admin_area: '/:locale/admin/projects/:projectId/general')
    end
    expect(results.compact.size).to eq 1
    expect(user.pulse_checks.sole.status).to eq 'shown'
  end
end
