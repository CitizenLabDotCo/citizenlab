# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Report do
  subject(:report) { build(:report) }

  it 'cannot be associated to the same phase as another report' do
    other_report = create(:report, :with_phase)
    report.phase = other_report.phase
    expect(report).not_to be_valid
    expect(report.errors[:phase_id]).to include('has already been taken')
  end

  it 'can be associated to the same phase as another report for a community monitor phase' do
    phase = create(:community_monitor_survey_phase)
    other_report = create(:report, phase: phase)
    report.phase = other_report.phase
    expect(report).to be_valid
  end

  it 'can be visible only if associated to a phase' do
    report.phase_id = nil
    report.visible = true
    expect(report).not_to be_valid
    expect(report.errors[:visible]).to include('is not included in the list')
  end

  it { is_expected.to validate_uniqueness_of(:name) }
  it { is_expected.to belong_to(:owner).class_name('User').optional }
  it { is_expected.to have_one(:layout).class_name('ContentBuilder::Layout').dependent(:destroy) }

  describe 'quarter' do
    it 'is valid if nil' do
      report.quarter = nil
      expect(report).to be_valid
    end

    it 'is valid if between 1 and 4' do
      report.quarter = 2
      expect(report).to be_valid
    end

    it 'is invalid if less than 1' do
      report.quarter = 0
      expect(report).not_to be_valid
    end

    it 'is invalid if greater than 4' do
      report.quarter = 5
      expect(report).not_to be_valid
    end
  end

  describe 'year' do
    it 'is valid if nil' do
      report.year = nil
      expect(report).to be_valid
    end

    it 'is valid if between 2024 and 2050' do
      report.year = 2025
      expect(report).to be_valid
    end

    it 'is invalid if less than 2024' do
      report.year = 2023
      expect(report).not_to be_valid
    end

    it 'is invalid if greater than 2050' do
      report.year = 2051
      expect(report).not_to be_valid
    end
  end

  describe 'user deletion' do
    it 'keeps reports that the user owned' do
      report = create(:report)
      user = report.owner
      expect(user.destroy).to be_truthy
      expect(report.reload.owner).to be_nil
    end
  end

  describe '.listable' do
    def generation_tracker(report, completed: false, created_at: Time.current)
      create(
        :jobs_tracker,
        root_job_type: ReportBuilder::GenerateReportJob.name,
        context: report.project,
        project: report.project,
        completed_at: completed ? Time.current : nil,
        created_at: created_at
      )
    end

    it 'hides an empty project report while the run that is filling it is under way' do
      report = create(:report, :with_project)
      report.layout.update!(craftjs_json: {})
      generation_tracker(report)

      expect(described_class.listable).not_to include(report)
    end

    it 'lists an empty project report once the run is over, so it can be opened or deleted' do
      report = create(:report, :with_project)
      report.layout.update!(craftjs_json: {})
      generation_tracker(report, completed: true)

      expect(described_class.listable).to include(report)
    end

    it 'lists an empty project report whose run never completed but is long past, rather than hiding it for good' do
      report = create(:report, :with_project)
      report.layout.update!(craftjs_json: {})
      generation_tracker(report, created_at: 2.hours.ago)

      expect(described_class.listable).to include(report)
    end

    it 'lists a project report with content even while it is being generated again' do
      report = create(:report, :with_project)
      report.layout.update!(craftjs_json: { 'ROOT' => { 'type' => 'div' } })
      generation_tracker(report)

      expect(described_class.listable).to include(report)
    end

    it 'lists a report that is not about a project even while it is empty' do
      report = create(:report)
      report.layout.update!(craftjs_json: {})

      expect(described_class.listable).to include(report)
    end
  end

  describe 'deletion' do
    it 'takes its ready notifications with it, rather than being refused by the foreign key' do
      report = create(:report, :with_phase)
      notification = Notifications::ReportGenerated.create!(
        recipient: create(:admin),
        report: report,
        project: report.reported_project,
        phase: report.phase
      )

      expect { report.destroy! }.not_to raise_error
      expect(Notification.where(id: notification.id)).to be_empty
    end
  end
end
