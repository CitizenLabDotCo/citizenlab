# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ReportGenerated do
  describe '.make_notifications_on' do
    let(:admin) { create(:admin) }

    it 'tells the admin who asked for it, about the project it is about' do
      report = create(:report, project: create(:project))
      activity = create(:activity, item: report, action: 'generated', user: admin)

      notifications = described_class.make_notifications_on(activity)

      expect(notifications.size).to eq 1
      expect(notifications.first).to have_attributes(
        recipient_id: admin.id,
        report_id: report.id,
        project_id: report.project_id
      )
      expect(notifications.first).to be_valid
    end

    it 'points at the project behind the phase for a phase report' do
      phase = create(:phase)
      report = create(:report, phase: phase)
      activity = create(:activity, item: report, action: 'generated', user: admin)

      notification = described_class.make_notifications_on(activity).first

      expect(notification).to have_attributes(project_id: phase.project_id, phase_id: phase.id)
    end

    it 'tells nobody when the run had no owner to tell' do
      report = create(:report, project: create(:project))
      activity = create(:activity, item: report, action: 'generated', user: nil)

      expect(described_class.make_notifications_on(activity)).to be_empty
    end

    it 'tells nobody about a report with no project to report on' do
      activity = create(:activity, item: create(:report), action: 'generated', user: admin)

      expect(described_class.make_notifications_on(activity)).to be_empty
    end
  end
end
