require "rails_helper"

describe SideFxUserService do
  let(:service) { SideFxUserService.new }
  let(:current_user) { create(:user) }
  let(:user) { create(:user) }

  describe "after_create" do
    it "logs a 'created' action when a user is created" do
      expect {service.after_create(user, current_user)}.
        to have_enqueued_job(LogActivityJob).with(user, 'created', current_user, user.updated_at.to_i)
    end

  end

  describe "after_update" do

    it "logs a 'changed_avatar' action job when the avatar has changed" do
      user.update(avatar: File.open(Rails.root.join("spec", "fixtures", "lorem-ipsum.jpg")))
      expect {service.after_update(user, current_user)}.
        to have_enqueued_job(LogActivityJob).with(user, 'changed', current_user, user.updated_at.to_i)
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

  end

end
