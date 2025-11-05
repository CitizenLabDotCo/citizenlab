# frozen_string_literal: true

require 'rails_helper'

describe SideFxStaticPageService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:page) { create(:static_page, bottom_info_section_multiloc: { en: 'some text' }) }

  describe 'after_create' do
    it "logs a 'created' action when a page is created" do
      expect { service.after_create(page, user) }
        .to have_enqueued_job(LogActivityJob).with(page, 'created', user, page.created_at.to_i)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the page has changed" do
      page.update!(title_multiloc: { 'en' => 'changed' })
      expect { service.after_update(page, user) }
        .to have_enqueued_job(LogActivityJob).with(page, 'changed', user, page.updated_at.to_i)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the page is destroyed" do
      freeze_time do
        frozen_page = page.destroy!
        expect { service.after_destroy(frozen_page, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end
  end
end
