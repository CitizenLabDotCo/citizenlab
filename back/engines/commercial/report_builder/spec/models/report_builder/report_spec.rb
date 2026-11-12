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

  describe 'the project link' do
    it 'cannot be about the same project as another report' do
      other_report = create(:report, :with_project)
      report.project = other_report.project
      expect(report).not_to be_valid
      expect(report.errors[:project_id]).to include('has already been taken')
    end

    it 'cannot be about a phase and a project at once' do
      report.phase = create(:phase)
      report.project = create(:project)
      expect(report).not_to be_valid
      expect(report.errors[:project_id]).to include('must be blank')
    end

    describe '#reported_project' do
      it 'is the project itself for a project report' do
        project = create(:project)
        expect(build(:report, project: project).reported_project).to eq project
      end

      it "is the phase's project for a phase report" do
        phase = create(:phase)
        expect(build(:report, phase: phase).reported_project).to eq phase.project
      end

      it 'is nothing for a global report, which is about neither' do
        expect(build(:report).reported_project).to be_nil
      end
    end
  end

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

  describe '#last_generation' do
    def generation(stopped:, saved:, at:)
      create(:report_run, report: report, kind: 'generation',
        stopped_because: stopped, applied_at: saved ? at : nil, created_at: at)
    end

    let(:report) { create(:report) }

    it 'is the run whose work the report holds' do
      wrote_it = generation(stopped: 'done', saved: true, at: 2.hours.ago)

      expect(report.last_generation).to eq wrote_it
    end

    # Whatever the reason it stopped, a run that saved nothing did not write what is
    # on screen — so it is not what "is this report whole" is asking about.
    it 'skips a later run that stopped without saving' do
      wrote_it = generation(stopped: 'done', saved: true, at: 2.hours.ago)
      generation(stopped: 'round_cap', saved: false, at: 1.hour.ago)
      generation(stopped: 'failed', saved: false, at: 30.minutes.ago)

      expect(report.last_generation).to eq wrote_it
    end

    it 'is nothing while no run has saved' do
      generation(stopped: 'failed', saved: false, at: 1.hour.ago)

      expect(report.last_generation).to be_nil
    end
  end

  describe '#fail_chat_turn!' do
    let(:report) { create(:report) }
    let(:chat) { report.chat!(locale: 'en') }

    it 'tells the admin the turn failed and lets them ask again' do
      chat.update!(status: 'running', turn_started_at: Time.current)

      report.fail_chat_turn!('turn_failed')

      expect(chat.reload).to have_attributes(status: 'failed', last_error_code: 'turn_failed')
      expect(chat.messages.last).to have_attributes(
        role: 'assistant', content: described_class::FAILED_TURN_REPLY, run_id: nil
      )
    end

    it 'leaves a chat alone that is not waiting for an answer' do
      expect { report.fail_chat_turn!('turn_failed') }.not_to change { chat.reload.messages.count }
      expect(chat).to be_idle
    end
  end

  describe '#recover_lost_runs!' do
    let(:report) { create(:report) }
    let(:chat) { report.chat!(locale: 'en') }
    let(:lost) { described_class::RUN_ASSUMED_LOST_AFTER.ago - 1.minute }

    it 'fails a chat turn whose job never came back, and the run it left going' do
      chat.update!(status: 'running', turn_started_at: lost)
      run = create(:report_run, report: report, kind: 'revision', stopped_because: nil, created_at: lost)

      report.recover_lost_runs!

      expect(chat.reload).to have_attributes(status: 'failed', last_error_code: 'turn_timed_out')
      expect(run.reload.stopped_because).to eq 'failed'
    end

    # A generation is not a chat turn, but a lost one is offered to stop forever all the same.
    it 'fails a lost generation too' do
      run = create(:report_run, report: report, stopped_because: nil, created_at: lost)

      report.recover_lost_runs!

      expect(run.reload.stopped_because).to eq 'failed'
    end

    it 'leaves a turn alone that may still be going' do
      chat.update!(status: 'running', turn_started_at: 10.minutes.ago)
      run = create(:report_run, report: report, kind: 'revision', stopped_because: nil, created_at: 10.minutes.ago)

      report.recover_lost_runs!

      expect(chat.reload).to be_running
      expect(run.reload).to be_running
    end

    it 'does nothing for a report nobody has chatted about' do
      expect { report.recover_lost_runs! }.not_to raise_error
    end
  end

  describe '#current_chat_turn?' do
    let(:report) { create(:report) }
    let(:chat) { report.chat!(locale: 'en') }
    let(:turn) { chat.messages.create!(role: 'user', content: 'shorter please') }

    it 'is true for the turn the chat is waiting on' do
      chat.update!(status: 'running', turn_started_at: Time.current)

      expect(report.current_chat_turn?(turn.id)).to be true
    end

    # What a job that waited out the queue comes back to: its turn was given up on and
    # the admin asked again.
    it 'is false once a newer turn has taken its place' do
      turn
      chat.messages.create!(role: 'user', content: 'and add a chart')
      chat.update!(status: 'running', turn_started_at: Time.current)

      expect(report.current_chat_turn?(turn.id)).to be false
    end

    it 'is false while nothing is waiting for an answer' do
      expect(report.current_chat_turn?(turn.id)).to be false
    end

    it 'is false for a report nobody has chatted about' do
      expect(report.current_chat_turn?(SecureRandom.uuid)).to be false
    end
  end

  describe 'deletion' do
    it 'takes the runs and the conversation they wrote with it' do
      report = create(:report)
      run = create(:report_run, report: report)
      run.append_message!(role: 'user', model_text: 'Generate the report.')

      expect { report.destroy! }
        .to change(AIAssistant::Run, :count).by(-1)
        .and change(AIAssistant::Conversation, :count).by(-1)
        .and change(AIAssistant::Message, :count).by(-1)
    end

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
