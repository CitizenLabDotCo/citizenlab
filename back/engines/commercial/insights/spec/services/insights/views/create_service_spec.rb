# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::Views::CreateService do
  subject(:service) { described_class.new(current_user, params) }

  let_it_be(:origins) { create_list(:project, 2) }
  let_it_be(:current_user) { create(:admin) }

  let(:view_name) { 'view-name' }
  let(:data_sources) { origins.map { |o| { origin_id: o.id, origin_type: o.class.name } } }
  let(:params) { { name: view_name, data_sources: data_sources } }

  describe '#execute' do
    it 'creates a new view' do
      view = nil
      expect { view = service.execute }.to change { Insights::View.count }.by(1)
      expect(view.name).to eq(view_name)
      expect(view.data_sources.includes(:origin).map(&:origin)).to match_array(origins)
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

    context 'when no data source is provided' do
      let(:data_sources) { [] }

      it 'raises an error' do
        expect { service.execute }.to raise_error(ArgumentError)
      end
    end
  end
end
