# frozen_string_literal: true

require 'rails_helper'

describe 'rake setup_and_support:mass_official_feedback' do # rubocop:disable RSpec/DescribeClass
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['setup_and_support:mass_official_feedback'].reenable }

  let(:locale) { 'en' }
  let(:host) { Tenant.current.host }
  let!(:author) { create(:admin) }
  let!(:status_under_review) { create(:idea_status, title_multiloc: { locale => 'Under review' }) }
  let!(:status_proposed) { create(:idea_status, title_multiloc: { locale => 'Proposed' }) }
  let!(:idea1) { create(:idea, idea_status: status_proposed) }
  let!(:idea2) { create(:idea, idea_status: status_proposed) }

  let(:csv_file) do
    Tempfile.new(['mass_official_feedback', '.csv']).tap do |f|
      f.write(csv_content)
      f.close
    end
  end

  before { allow(LogActivityJob).to receive(:perform_later) }
  after { csv_file.unlink }

  def invoke
    Rake::Task['setup_and_support:mass_official_feedback'].invoke(csv_file.path, host, locale)
  end

  context 'when all rows are valid' do
    let(:csv_content) do
      <<~CSV
        ID,Feedback,Feedback Author Name,Feedback Email,New Status
        #{idea1.id},Thank you {{first_name}}.,City Team,#{author.email},Under review
        #{idea2.id},We reviewed your submission.,City Team,#{author.email},
      CSV
    end

    it 'creates feedback, updates statuses, and enqueues activity jobs' do
      invoke

      expect(OfficialFeedback.count).to eq(2)
      expect(idea1.reload.idea_status).to eq(status_under_review)
      expect(idea2.reload.idea_status).to eq(status_proposed)
      expect(OfficialFeedback.find_by(idea: idea1).body_multiloc[locale]).to include(idea1.author.first_name)
      expect(LogActivityJob).to have_received(:perform_later).at_least(:twice)
    end
  end

  context 'when an idea is not found' do
    let(:csv_content) do
      <<~CSV
        ID,Feedback,Feedback Author Name,Feedback Email,New Status
        #{idea1.id},Thank you.,City Team,#{author.email},
        00000000-0000-0000-0000-000000000000,Feedback.,City Team,#{author.email},
      CSV
    end

    it 'creates no feedback and leaves statuses unchanged' do
      invoke

      expect(OfficialFeedback.count).to eq(0)
      expect(idea1.reload.idea_status).to eq(status_proposed)
    end
  end

  context 'when a feedback author is not found' do
    let(:csv_content) do
      <<~CSV
        ID,Feedback,Feedback Author Name,Feedback Email,New Status
        #{idea1.id},Thank you.,City Team,unknown@example.org,
        #{idea2.id},Feedback.,City Team,#{author.email},
      CSV
    end

    it 'creates no feedback' do
      invoke

      expect(OfficialFeedback.count).to eq(0)
    end
  end

  context 'when a status title is not found' do
    let(:csv_content) do
      <<~CSV
        ID,Feedback,Feedback Author Name,Feedback Email,New Status
        #{idea1.id},Thank you.,City Team,#{author.email},Nonexistent Status
        #{idea2.id},Feedback.,City Team,#{author.email},
      CSV
    end

    it 'creates no feedback and leaves statuses unchanged' do
      invoke

      expect(OfficialFeedback.count).to eq(0)
      expect(idea1.reload.idea_status).to eq(status_proposed)
    end
  end

  context 'when a write fails mid-transaction' do
    let(:csv_content) do
      <<~CSV
        ID,Feedback,Feedback Author Name,Feedback Email,New Status
        #{idea1.id},Thank you.,City Team,#{author.email},Under review
        #{idea2.id},Feedback.,City Team,#{author.email},
      CSV
    end

    before { allow(OfficialFeedback).to receive(:create!).and_raise(ActiveRecord::RecordInvalid) }

    it 'rolls back all writes and enqueues no jobs' do
      invoke

      expect(OfficialFeedback.count).to eq(0)
      expect(idea1.reload.idea_status).to eq(status_proposed)
      expect(LogActivityJob).not_to have_received(:perform_later)
    end
  end
end
