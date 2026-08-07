# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::IdeaMarkedAsSpam do
  describe 'make_notifications_on' do
    let!(:admin) { create(:admin) }
    let(:idea) { create(:idea) }

    def report_spam!
      spam_report = create(:spam_report, spam_reportable: idea)
      activity = create(:activity, item: spam_report, action: 'created')
      described_class.make_notifications_on(activity)
    end

    def flag_for(idea)
      FlagInappropriateContent::InappropriateContentFlag.create!(flaggable: idea)
    end

    it 'notifies moderators of the first report' do
      expect(report_spam!).to be_present
    end

    it 'does not notify when the report has no author' do
      spam_report = create(:spam_report, spam_reportable: idea, user: nil)
      activity = create(:activity, item: spam_report, action: 'created')

      expect(described_class.make_notifications_on(activity)).to be_empty
    end

    it 'does not notify again when the input is reported once more and nothing has changed' do
      report_spam!.each(&:save!)

      expect(report_spam!).to be_empty
    end

    it 'does not notify again while an untouched flag is still open' do
      flag_for(idea).update_columns(updated_at: 1.minute.ago)
      report_spam!.each(&:save!)

      expect(report_spam!).to be_empty
    end

    it 'notifies again when the input was edited since the last notification' do
      report_spam!.each(&:save!)
      create(:activity, item: idea, action: 'changed', acted_at: 1.minute.from_now)

      expect(report_spam!).to be_present
    end

    it 'notifies again when a dismissed flag is re-opened by the new report' do
      report_spam!.each(&:save!)
      flag_for(idea).update_columns(deleted_at: nil, updated_at: 1.minute.from_now)

      expect(report_spam!).to be_present
    end
  end
end
