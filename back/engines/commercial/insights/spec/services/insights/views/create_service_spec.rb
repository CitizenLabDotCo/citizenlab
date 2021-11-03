# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::Views::CreateService do
  subject(:service) { described_class.new(current_user, params) }

  let(:params) { { scope_id: view_scope.id, name: view_name } }
  let(:view_name) { 'view-name' }

  let_it_be(:view_scope) { create(:project) }
  let_it_be(:current_user) { create(:admin) }

  describe '#execute' do
    # rubocop:disable RSpec/MultipleExpectations
    it 'creates a new view' do
      view = nil
      expect { view = service.execute }.to change { Insights::View.count }.by(1)
      expect(view.name).to eq(view_name)
      expect(view.scope).to eq(view_scope)
    end

    it 'enqueues a LogActivityJob job' do
      view = nil
      expect { view = service.execute }
        .to enqueue_job(LogActivityJob).with do |item, action, user, acted_at, _options|
        expect(item).to eq(view)
        expect(action).to eq('created')
        expect(user).to eq(current_user)
        expect(acted_at).to eq(view.created_at.to_i)
      end
    end
    # rubocop:enable RSpec/MultipleExpectations

    it 'authorizes the current user' do
      service.execute
      expect(service.send(:pundit_policy_authorized?)).to eq(true)
    end

    context 'when the view is not valid' do
      let(:view_name) { '' }

      it 'does not raise an error' do
        view = nil
        expect { view = service.execute }.not_to raise_error
        expect(view).not_to be_valid
      end
    end
  end
end
