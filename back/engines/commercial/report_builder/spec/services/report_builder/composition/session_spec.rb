# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::Session do
  let(:report) { create(:report) }

  def write(run, role, text)
    run.append_message!(role: role, model_text: text)
  end

  # saved: whether this run's work reached the report. Only a generation that did
  # can open a session.
  def run(kind, stopped: 'done', saved: true, messages: 2, at: Time.current)
    create(:report_run, report: report, kind: kind, stopped_because: stopped,
      applied_at: saved ? at : nil, created_at: at).tap do |run|
      messages.times { |i| write(run, i.even? ? 'user' : 'assistant', 'hello') }
    end
  end

  describe '.runs_for' do
    it 'is the latest finished generation and the turns after it, oldest first' do
      run('generation', at: 3.hours.ago)
      run('revision', at: 2.hours.ago)
      latest = run('generation', at: 1.hour.ago)
      turn = run('revision', at: 30.minutes.ago)

      expect(described_class.runs_for(report)).to eq [latest, turn]
    end

    it 'leaves out a run that is still going' do
      generation = run('generation', at: 1.hour.ago)
      run('revision', stopped: nil, at: 1.minute.ago)

      expect(described_class.runs_for(report)).to eq [generation]
    end

    it 'is empty for a report no model has written' do
      run('revision', at: 1.hour.ago)

      expect(described_class.runs_for(report)).to eq []
    end

    it 'starts at the generation that wrote the report, not a later one that failed' do
      generation = run('generation', at: 3.hours.ago)
      turn = run('revision', at: 2.hours.ago)
      run('generation', stopped: 'failed', saved: false, at: 1.hour.ago)

      expect(described_class.runs_for(report)).to eq [generation, turn]
    end

    # A run can stop for a respectable reason and still write nothing: the round cap
    # falls mid-edit, or the save itself fails. stopped_because cannot tell that from
    # a run that saved, which is why the job marks the one that did.
    it 'starts at the generation that saved, not a later one that stopped without saving' do
      generation = run('generation', at: 3.hours.ago)
      turn = run('revision', at: 2.hours.ago)
      run('generation', stopped: 'round_cap', saved: false, at: 1.hour.ago)

      expect(described_class.runs_for(report)).to eq [generation, turn]
    end

    it 'is empty while the only generation has saved nothing' do
      run('generation', stopped: 'round_cap', saved: false, at: 1.hour.ago)

      expect(described_class.runs_for(report)).to eq []
    end

    it 'drops the oldest turns once the conversation would not fit, never the generation' do
      generation = run('generation', at: 3.hours.ago)
      oldest_turn = run('revision', at: 2.hours.ago)
      newest = run('revision', at: 1.hour.ago)
      # Room for the generation and one turn, not for two.
      stub_const(
        "#{described_class}::MAX_HISTORY_CHARS",
        described_class.size_in_chars(generation) + described_class.size_in_chars(newest)
      )

      expect(described_class.runs_for(report)).to eq [generation, newest]
      expect(described_class.runs_for(report)).not_to include oldest_turn
    end
  end

  # The budget is characters because a turn that patches a layout is worth many
  # ordinary turns; counting messages would let one of them blow the prompt.
  describe '.size_in_chars' do
    it 'measures a turn by its size, not by how many messages it holds' do
      short = run('revision', messages: 2)
      long = run('revision', messages: 0)
      write(long, 'user', 'x' * 10_000)

      expect(described_class.size_in_chars(long)).to be > described_class.size_in_chars(short)
    end
  end
end
