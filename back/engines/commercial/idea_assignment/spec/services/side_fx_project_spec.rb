# frozen_string_literal: true

require 'rails_helper'

describe SideFxProjectService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe 'after_create' do
    it "sets the default_assignee to the user that creates the project if it's not a super admin" do
      create(:super_admin)
      create(:admin)
      admin2 = create(:admin)
      expect { service.after_create(project, admin2) }.to change(project, :default_assignee)
        .from(nil).to(admin2)
    end

    it "sets the default_assignee to the first active admin that's not a super admin if it's created by a super admin" do
      super_admin = create(:super_admin)
      create(:invite, invitee: create(:admin, registration_completed_at: nil, invite_status: 'pending'))
      admin1 = create(:admin)
      create(:admin)
      expect { service.after_create(project, super_admin) }.to change(project, :default_assignee)
        .from(nil).to(admin1)
    end

    it "doesn't change the default assignee if it's already set" do
      create(:admin)
      default_assignee = create(:admin)
      project.default_assignee = default_assignee
      expect { service.before_create(project, user) }.not_to change(project, :default_assignee)
    end
  end

  describe 'after_destroy_participation_data' do
    it "logs a 'participation_data_destroyed' activity" do
      expect { service.after_destroy_participation_data(project, user) }.to have_enqueued_job(LogActivityJob).with(
        project,
        'participation_data_destroyed',
        user,
        be_within(10).of(Time.now.to_i),
        { project_id: project.id }
      )
    end
  end
end
