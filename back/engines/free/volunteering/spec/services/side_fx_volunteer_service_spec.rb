# frozen_string_literal: true

require 'rails_helper'

describe Volunteering::SideFxVolunteerService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'created' action job when a volunteer is created" do
      volunteer = create(:volunteer, user: user)

      expect { service.after_create(volunteer, user) }
        .to enqueue_job(LogActivityJob)
        .with(volunteer, 'created', user, volunteer.created_at.to_i, anything)
        .exactly(1).times
    end

    it 'creates a follower' do
      volunteer = create(:volunteer)
      folder = create(:project_folder, projects: [volunteer.cause.participation_context.project])

      expect do
        service.after_create volunteer.reload, user
      end.to change(Follower, :count).from(0).to(2)

      expect(user.follows.pluck(:followable_id)).to contain_exactly volunteer.cause.participation_context.project.id, folder.id
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the volunteer is destroyed" do
      volunteer = create(:volunteer)
      freeze_time do
        frozen_volunteer = volunteer.destroy
        expect { service.after_destroy(frozen_volunteer, user) }
          .to enqueue_job(LogActivityJob).exactly(1).times
      end
    end
  end
end
