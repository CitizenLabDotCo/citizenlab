# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:field) { create(:custom_field) }

  describe 'after_create' do
    it 'swaps the text images' do
      expect_any_instance_of(TextImageService).to(
        receive(:swap_data_images).with(field, :description_multiloc).and_return(field.description_multiloc)
      )
      service.after_create field, user
    end
  end

  describe 'before_update' do
    it 'swaps the text images' do
      expect_any_instance_of(TextImageService).to(
        receive(:swap_data_images).with(field, :description_multiloc).and_return(field.description_multiloc)
      )
      service.before_update field, user
    end
  end
end
