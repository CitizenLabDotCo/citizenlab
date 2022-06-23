# frozen_string_literal: true

require 'rails_helper'

describe Insights::SideFxCategoryService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:category) { create(:category) }

  describe 'after_create' do
    it "logs a 'created' action job when a category (tag) has been created" do
      expect { service.after_create(category, user) }
        .to have_enqueued_job(LogActivityJob).with(category, 'created', user, category.updated_at.to_i)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when a category (tag) has changed" do
      category.update(name: 'changed_name')
      expect { service.after_update(category, user) }
        .to have_enqueued_job(LogActivityJob).with(category, 'changed', user, category.updated_at.to_i)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when a category (tag) is removed" do
      frozen_category = category.destroy
      expect { service.after_destroy(frozen_category, user) }
        .to have_enqueued_job(LogActivityJob)
    end
  end
end
