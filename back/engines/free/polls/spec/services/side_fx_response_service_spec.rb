# frozen_string_literal: true

require 'rails_helper'

describe Polls::SideFxResponseService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'created' action job when a response is created" do
      response = create(:poll_response, user: user)

      expect { service.after_create(response, user) }
        .to enqueue_job(LogActivityJob)
        .with(response, 'created', user, response.created_at.to_i, anything)
        .exactly(1).times
    end

    it 'creates a follower' do
      response = create(:poll_response)
      folder = create(:project_folder, projects: [response.participation_context.project])

      expect do
        service.after_create response.reload, user
      end.to change(Follower, :count).from(0).to(2)

      expect(user.follows.pluck(:followable_id)).to contain_exactly response.participation_context.project.id, folder.id
    end
  end
end
