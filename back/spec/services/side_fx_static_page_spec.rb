require "rails_helper"

describe SideFxStaticPageService do
  let(:service) { SideFxStaticPageService.new }
  let(:user) { create(:user) }
  let(:page) { create(:static_page) }

  describe "after_create" do
    it "logs a 'created' action when a page is created" do
      expect {service.after_create(page, user)}.
        to have_enqueued_job(LogActivityJob).with(page, 'created', user, page.created_at.to_i)
    end

    it "runs the body through the text image service" do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(page, :body_multiloc).and_return(page.body_multiloc)
      service.after_create(page, user)
    end
  end

  describe "before_update" do
    it "runs the description through the text image service" do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(page, :body_multiloc).and_return(page.body_multiloc)
      service.before_update(page, user)
    end
  end

  describe "after_update" do
    it "logs a 'changed' action job when the page has changed" do
      page.update!(title_multiloc: {'en' => 'changed'})
      expect {service.after_update(page, user)}.
        to have_enqueued_job(LogActivityJob).with(page, 'changed', user, page.updated_at.to_i)
    end
  end

  describe "after_destroy" do
    it "logs a 'deleted' action job when the page is destroyed" do
      travel_to Time.now do
        frozen_page = page.destroy!
        expect {service.after_destroy(frozen_page, user)}.
          to have_enqueued_job(LogActivityJob)
      end
    end
  end

end
