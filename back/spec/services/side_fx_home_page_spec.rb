# frozen_string_literal: true

require 'rails_helper'

describe SideFxHomePageService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:page) { create(:home_page, top_info_section_multiloc: { en: 'some text' }, bottom_info_section_multiloc: { en: 'some text' }) }

  describe 'before_update' do
    it 'runs runs both info sections through the text image service' do
      obj = instance_double(TextImageService)
      allow(TextImageService).to receive(:new).and_return(obj)
      expect(obj).to receive(:swap_data_images).with(page, :top_info_section_multiloc).and_return(page.top_info_section_multiloc)
      expect(obj).to receive(:swap_data_images).with(page, :bottom_info_section_multiloc).and_return(page.bottom_info_section_multiloc)
      service.before_update(page, user)
    end
  end
end
