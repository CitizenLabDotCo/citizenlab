# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Run do
  let(:report) { create(:report) }

  def write(run, role, text, **attributes)
    run.append_message!(role: role, content: text, displayed: false, **attributes)
  end

  describe '#append_message!' do
    it 'adds the message to the report conversation and widens the range the run wrote' do
      run = create(:report_run, report: report)
      first = write(run, 'user', 'Generate the report.')
      last = write(run, 'assistant', 'Done.')

      expect(report.chat.messages).to eq [first, last]
      expect([run.first_position, run.last_position]).to eq [first.position, last.position]
    end

    it 'continues the numbering of the messages that came before it' do
      earlier = create(:report_run, report: report)
      write(earlier, 'user', 'Generate the report.')
      run = create(:report_run, report: report, kind: 'revision')

      expect(write(run, 'user', 'Shorter, please.').position).to eq 2
    end
  end

  describe '#messages' do
    it 'is what this run wrote for the model, and nothing another run wrote' do
      earlier = create(:report_run, report: report)
      write(earlier, 'user', 'Generate the report.')
      run = create(:report_run, report: report, kind: 'revision')
      prompt = write(run, 'user', 'Shorter, please.')
      run.append_message!(role: 'assistant', content: 'Shortened.', replayed: false)

      expect(run.messages).to eq [prompt]
    end

    it 'is nothing for a run that has not written yet' do
      expect(create(:report_run, report: report).messages).to be_empty
    end
  end

  describe '#rounds' do
    it 'counts what the model said, not what it was told' do
      run = create(:report_run, report: report)
      write(run, 'user', 'Generate the report.')
      write(run, 'assistant', 'Looking.')
      write(run, 'user', 'result')
      write(run, 'assistant', 'Done.')

      expect(run.rounds).to eq 2
    end

    it 'is zero for a run that never got a reply' do
      expect(create(:report_run, report: report).rounds).to eq 0
    end
  end

  # Zero cache reads across a multi-round run means the prompt is not stable and every
  # round is being paid for in full — the number worth watching after a prompt change.
  describe '#cache_read_tokens' do
    it 'reads what the provider reported' do
      run = create(:report_run, report: report, usage: { 'cache_read_input_tokens' => 9000 })

      expect(run.cache_read_tokens).to eq 9000
    end

    it 'is zero when the provider said nothing about caching' do
      expect(create(:report_run, report: report, usage: {}).cache_read_tokens).to eq 0
    end
  end

  describe 'stopped_because' do
    it 'accepts every reason a run can end' do
      described_class::STOP_REASONS.each do |reason|
        expect(build(:report_run, report: report, stopped_because: reason)).to be_valid
      end
    end

    it 'is nothing while the run is still going' do
      run = create(:report_run, report: report, stopped_because: nil)

      expect(run).to be_running
      expect(described_class.running).to include run
      expect(described_class.finished).not_to include run
    end

    it 'rejects a reason nothing produces' do
      run = build(:report_run, report: report, stopped_because: 'bored')

      expect(run).to be_invalid
      expect(run.errors.details[:stopped_because]).to include(hash_including(error: :inclusion))
    end

    it 'knows which endings left the report unfinished' do
      early, whole = described_class::STOP_REASONS.partition do |reason|
        build(:report_run, report: report, stopped_because: reason).stopped_early?
      end

      expect(early).to match_array %w[round_cap timeout cancelled]
      expect(whole).to match_array %w[done failed]
    end
  end

  describe 'kind' do
    it 'is a generation or a chat turn' do
      expect(build(:report_run, report: report, kind: 'revision')).to be_valid
      expect(build(:report_run, report: report, kind: 'daydream')).to be_invalid
    end
  end

  describe '.session_runs_for' do
    # saved: whether this run's work reached the report. Only a generation that did
    # can open a session.
    def run(kind, stopped: 'done', saved: true, messages: 2, at: Time.current)
      create(:report_run, report: report, kind: kind, stopped_because: stopped,
        report_saved_at: saved ? at : nil, created_at: at).tap do |run|
        messages.times { |i| write(run, i.even? ? 'user' : 'assistant', 'hello') }
      end
    end

    it 'is the latest finished generation and the turns after it, oldest first' do
      run('generation', at: 3.hours.ago)
      run('revision', at: 2.hours.ago)
      latest = run('generation', at: 1.hour.ago)
      turn = run('revision', at: 30.minutes.ago)

      expect(described_class.session_runs_for(report)).to eq [latest, turn]
    end

    it 'leaves out a run that is still going' do
      generation = run('generation', at: 1.hour.ago)
      run('revision', stopped: nil, at: 1.minute.ago)

      expect(described_class.session_runs_for(report)).to eq [generation]
    end

    it 'is empty for a report no model has written' do
      run('revision', at: 1.hour.ago)

      expect(described_class.session_runs_for(report)).to eq []
    end

    it 'starts at the generation that wrote the report, not a later one that failed' do
      generation = run('generation', at: 3.hours.ago)
      turn = run('revision', at: 2.hours.ago)
      run('generation', stopped: 'failed', saved: false, at: 1.hour.ago)

      expect(described_class.session_runs_for(report)).to eq [generation, turn]
    end

    # A run can stop for a respectable reason and still write nothing: the round cap
    # falls mid-edit, or the save itself fails. stopped_because cannot tell that from
    # a run that saved, which is why the job marks the one that did.
    it 'starts at the generation that saved, not a later one that stopped without saving' do
      generation = run('generation', at: 3.hours.ago)
      turn = run('revision', at: 2.hours.ago)
      run('generation', stopped: 'round_cap', saved: false, at: 1.hour.ago)

      expect(described_class.session_runs_for(report)).to eq [generation, turn]
    end

    it 'is empty while the only generation has saved nothing' do
      run('generation', stopped: 'round_cap', saved: false, at: 1.hour.ago)

      expect(described_class.session_runs_for(report)).to eq []
    end

    it 'drops the oldest turns once the conversation would not fit, never the generation' do
      generation = run('generation', at: 3.hours.ago)
      oldest_turn = run('revision', at: 2.hours.ago)
      newest = run('revision', at: 1.hour.ago)
      # Room for the generation and one turn, not for two.
      stub_const(
        "#{described_class}::MAX_HISTORY_CHARS",
        generation.size_in_chars + newest.size_in_chars
      )

      expect(described_class.session_runs_for(report)).to eq [generation, newest]
      expect(described_class.session_runs_for(report)).not_to include oldest_turn
    end

    # The budget is characters because a turn that patches a layout is worth many
    # ordinary turns; counting messages would let one of them blow the prompt.
    it 'measures a turn by its size, not by how many messages it holds' do
      short = run('revision', messages: 2)
      long = run('revision', messages: 0)
      write(long, 'user', 'x' * 10_000)

      expect(long.size_in_chars).to be > short.size_in_chars
    end
  end

  describe 'when the report goes' do
    it 'takes the runs and the conversation they wrote with it' do
      write(create(:report_run, report: report), 'user', 'Generate the report.')

      expect { report.destroy! }
        .to change(described_class, :count).by(-1)
        .and change(AIAssistant::Conversation, :count).by(-1)
        .and change(AIAssistant::Message, :count).by(-1)
    end
  end
end
