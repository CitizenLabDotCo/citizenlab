require 'rails_helper'

describe Insights::SideFxCategoryService do
  let(:service) { SideFxCategoryService.new }
  let(:current_user) { create(:user) }
  let(:category) { Insights::Category.new() }

  describe 'after_create' do
    it "logs a 'created' action job when a category (tag) has been created" do
      expect { service.after_create(category, current_user) }
        .to  have_enqueued_job(LogActivityJob).with(category, 'created', current_user, category.updated_at.to_i, {})
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when a category (tag) has changed" do
      expect { service.after_update(category, current_user) }
        .to  have_enqueued_job(LogActivityJob).with(category, 'changed', current_user, category.updated_at.to_i, {})
    end
  end

end

