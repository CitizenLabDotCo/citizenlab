require "rails_helper"

describe SideFxUserService do
  let(:service) { SideFxUserService.new }
  let(:current_user) { create(:user) }
  let(:user) { create(:user) }

  describe "before_create" do
    it "set registration_completed_at if there's no user custom fields and the user is not invited" do
      user.update(registration_completed_at: nil)
      create(:custom_field, resource_type: 'CustomForm')
      service.before_create(user, current_user)
      expect(user.registration_completed_at).to be_present
    end

    it "doesn't set registration_completed_at if there's a custom fields" do
      user.update(registration_completed_at: nil)
      create(:custom_field)
      service.before_create(user, current_user)
      expect(user.registration_completed_at).to be_blank
    end
  end

  describe "after_create" do
    it "logs a 'created' action when a user is created" do
      expect {service.after_create(user, current_user)}.
        to have_enqueued_job(LogActivityJob).with(user, 'created', user, user.updated_at.to_i)
    end

    it "generates an avatar after a user is created" do
      expect {service.after_create(user, current_user)}.
        to have_enqueued_job(GenerateUserAvatarJob).with(user)
    end

    it "identifies the user with segment after a user is created" do
      expect {service.after_create(user, current_user)}.
        to have_enqueued_job(TrackUserJob).with(user)
    end

    it "logs a UpdateMemberCountJob" do
      expect {service.after_create(user, current_user)}.to have_enqueued_job(UpdateMemberCountJob)
    end

    it "creates an unsubscription_token" do
      service.after_create(user, current_user)
      expect(user.email_campaigns_unsubscription_token).to be_present
    end

  end

  describe "after_update" do

    it "logs a 'changed_avatar' action job when the avatar has changed" do
      user.update(avatar: File.open(Rails.root.join("spec", "fixtures", "lorem-ipsum.jpg")))
      expect {service.after_update(user, current_user)}.
        to have_enqueued_job(LogActivityJob).with(user, 'changed', current_user, user.updated_at.to_i)
    end

    it "logs a 'completed_registration' action job when the registration is set" do
      user.update(registration_completed_at: nil)
      user.update(registration_completed_at: Time.now)
      expect {service.after_update(user, current_user)}.
        to have_enqueued_job(LogActivityJob).with(user, 'completed_registration', current_user, user.updated_at.to_i)
    end

    it "logs a 'admin_rights_given' action job when user has been made admin" do
      user.update(roles: [{"type" => "admin"}])
      expect {service.after_update(user, current_user)}.
        to have_enqueued_job(LogActivityJob).with(user, 'admin_rights_given', current_user, user.updated_at.to_i)
    end

    it "logs a UpdateMemberCountJob" do
      expect {service.after_update(user, current_user)}.to have_enqueued_job(UpdateMemberCountJob)
    end

    it "unassigns all assigned ideas if the user no longer is admin" do
      user = create(:admin)
      idea = create(:idea, assignee: user)
      user.update(roles: [])
      expect{service.after_update(user, current_user)}.to change{idea.reload.assignee}.from(user).to(nil)
    end

    it "unassigns all default_assigned_projects if the user no longer is admin" do
      user = create(:admin)
      project = create(:project, default_assignee: user)
      user.update(roles: [])
      expect{service.after_update(user, current_user)}.to change{project.reload.default_assignee}.from(user).to(nil)
    end

    it "unassigns all assigned ideas of the project the user is no longer moderator of" do
      project1 = create(:project)
      project2 = create(:project)
      user = create(:user, roles: [
        {"type" => 'project_moderator', "project_id" => project1.id},
        {"type" => 'project_moderator', "project_id" => project2.id}
      ])
      idea1 = create(:idea, project: project1, assignee: user)
      idea2 = create(:idea, project: project2, assignee: user)
      user.update(roles: [{"type" => 'project_moderator', "project_id" => project1.id}])
      expect{service.after_update(user, current_user)}.to change{idea2.reload.assignee}.from(user).to(nil)
      expect(idea1.reload.assignee).to eq user
    end

    it "unassigns all default_assigned_projects the user is no longer moderator of" do
      project1 = create(:project)
      project2 = create(:project)
      user = create(:user, roles: [
        {"type" => 'project_moderator', "project_id" => project1.id},
        {"type" => 'project_moderator', "project_id" => project2.id}
      ])
      project1.update!(default_assignee: user)
      project2.update!(default_assignee: user)
      user.update(roles: [{"type" => 'project_moderator', "project_id" => project1.id}])
      expect{service.after_update(user, current_user)}.to change{project2.reload.default_assignee}.from(user).to(nil)
      expect(project1.reload.default_assignee).to eq user
    end

  end

  describe "after_destroy" do
    it "logs a 'deleted' action job when the user is destroyed" do
      travel_to Time.now do
        frozen_user = user.destroy
        expect {service.after_destroy(frozen_user, current_user)}.
          to have_enqueued_job(LogActivityJob)
      end
    end

    it "logs a UpdateMemberCountJob" do
      expect {service.after_destroy(user, current_user)}.to have_enqueued_job(UpdateMemberCountJob)
    end

  end

end
