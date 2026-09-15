# frozen_string_literal: true

module Notifications
  # Tells the admin who asked for a report that the LLM has finished writing it.
  #
  # Composing a report takes minutes and runs in the background, so the admin is
  # told to walk away. This is how they learn it is done without watching the tab.
  class ReportGenerated < Notification
    validates :report, :project, presence: true

    ACTIVITY_TRIGGERS = { 'ReportBuilder::Report' => { 'generated' => true } }
    EVENT_NAME = 'Report generated'

    def self.make_notifications_on(activity)
      report = activity.item
      # The admin who started the run; nobody else asked for this.
      recipient_id = activity.user_id
      project = report&.reported_project
      return [] if report.nil? || recipient_id.nil? || project.nil?

      [new(
        recipient_id: recipient_id,
        report: report,
        project: project,
        phase: report.phase
      )]
    end
  end
end
