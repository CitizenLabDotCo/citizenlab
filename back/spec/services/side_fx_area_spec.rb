# frozen_string_literal: true

require 'rails_helper'

describe SideFxAreaService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:area) { create(:area) }

  describe 'after_create' do
    it "logs a 'created' action when a area is created" do
      expect { service.after_create(area, user) }
        .to have_enqueued_job(LogActivityJob).with(area, 'created', user, area.created_at.to_i)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the area has changed" do
      area.update(title_multiloc: { en: 'changed' })
      expect { service.after_update(area, user) }
        .to have_enqueued_job(LogActivityJob).with(area, 'changed', user, area.updated_at.to_i)
    end
  end

  describe 'before_destroy' do
    it 'destroys custom field option values for domicile that refer to this area' do
      domicile_cf = create(:custom_field_select, code: 'domicile', key: 'domicile')
      lives_in_area = create(:user, custom_field_values: { domicile_cf.key => area.id })
      service.before_destroy(area, user)
      expect(lives_in_area.reload.custom_field_values).to eq({})
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the area is destroyed" do
      freeze_time do
        frozen_area = area.destroy
        expect { service.after_destroy(frozen_area, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end
  end
end
