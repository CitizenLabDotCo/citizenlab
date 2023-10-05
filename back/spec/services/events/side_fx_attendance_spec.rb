# frozen_string_literal: true

require 'rails_helper'

describe Events::SideFxAttendanceService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:attendance) { create(:event_attendance) }

  describe 'after_create' do
    it "logs a 'created' action when an attendance is created" do
      expect { service.after_create(attendance, user) }
        .to enqueue_job(LogActivityJob)
        .with(attendance, 'created', user, attendance.created_at.to_i)
    end

    it 'updates smart group counts when an attendance is created' do
      expect { service.after_create(attendance, user) }
        .to enqueue_job(UpdateMemberCountJob)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when an attendance is destroyed" do
      freeze_time do
        frozen_attendance = attendance.destroy
        expect { service.after_destroy(frozen_attendance, user) }
          .to enqueue_job(LogActivityJob)
      end
    end

    it 'updates smart group counts when an attendance is destroyed' do
      expect { service.after_create(attendance, user) }
        .to enqueue_job(UpdateMemberCountJob)
    end
  end
end
