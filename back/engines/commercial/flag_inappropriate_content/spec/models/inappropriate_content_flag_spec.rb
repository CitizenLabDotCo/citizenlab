# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FlagInappropriateContent::InappropriateContentFlag do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:inappropriate_content_flag)).to be_valid
    end
  end

  describe 'toxicity_label' do
    it 'rejects unknown labels' do
      expect(build(:inappropriate_content_flag, toxicity_label: 'nonsense')).to be_invalid
    end
  end

  describe '#generate_commands' do
    let_it_be(:author, reload: true) { create(:user, first_name: 'Biggus', last_name: 'Dickus') }
    let_it_be(:idea, reload: true) { create(:idea, title_multiloc: { 'en' => 'Flagged idea' }, body_multiloc: { 'en' => 'This is a flagged idea.' }, author:, slug: 'flagged-idea') }
    let_it_be(:flag, reload: true) { create(:inappropriate_content_flag, flaggable: idea) }
    let_it_be(:campaign, reload: true) { create(:inappropriate_content_flagged_campaign) }
    let_it_be(:notification, reload: true) { create(:inappropriate_content_flagged, inappropriate_content_flag: flag) }
    let_it_be(:notification_activity, reload: true) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command).to match(
        event_payload: a_hash_including(
          flaggable_author_name: 'Biggus Dickus',
          flaggable_type: 'Idea',
          flag_automatically_detected: true,
          flaggable_url: 'http://example.org/en/ideas/flagged-idea',
          flaggable_title_multiloc: { 'en' => 'Flagged idea' },
          flaggable_body_multiloc: { 'en' => 'This is a flagged idea.' }
        )
      )
    end
  end

  describe 'reason_code' do
    it 'is inappropriate when toxicity was detected' do
      flag = create(:inappropriate_content_flag, toxicity_label: 'insult')
      create_list(:spam_report, 3, spam_reportable: flag.flaggable, reason_code: 'wrong_content')
      expect(flag.reload.reason_code).to eq 'inappropriate'
    end

    it 'is wrong_content when no toxicity was detected and wrong_content is the most frequently non-other reported label' do
      flag = create(:inappropriate_content_flag, toxicity_label: nil)
      %w[inappropriate wrong_content other wrong_content other other].each do |reason|
        report = build(:spam_report, spam_reportable: flag.flaggable, reason_code: reason)
        report.other_reason = 'this statement gives me the creeps' if reason == 'other'
        report.save!
      end
      expect(flag.reload.reason_code).to eq 'wrong_content'
    end

    it 'is wrong_content when no toxicity was detected and all spam reports have other reason' do
      flag = create(:inappropriate_content_flag, toxicity_label: nil)
      create_list(:spam_report, 2, spam_reportable: flag.flaggable, reason_code: 'other', other_reason: 'this statement gives me the creeps')
      expect(flag.reload.reason_code).to eq 'inappropriate'
    end
  end
end
