# frozen_string_literal: true

require 'rails_helper'

describe SideFxStaticPageService do
  subject(:service) { described_class.new }

  let(:user) { create(:user) }

  def custom_page_layout(page)
    ContentBuilder::Layout.find_by(
      content_buildable: page,
      code: ContentBuilder::CustomPageLayoutService::CODE
    )
  end

  describe '#after_create' do
    it 'logs a created activity' do
      page = create(:static_page)

      expect { service.after_create(page, user) }
        .to have_enqueued_job(LogActivityJob).with(page, 'created', user, page.created_at.to_i)
    end

    it 'provisions a content builder layout for a global custom page' do
      page = create(:static_page)

      service.after_create(page, user)

      expect(custom_page_layout(page)).to be_present
    end

    it 'does not provision a layout for a policy page' do
      page = create(:static_page, code: 'faq', slug: 'faq')

      service.after_create(page, user)

      expect(custom_page_layout(page)).to be_nil
    end
  end
end
