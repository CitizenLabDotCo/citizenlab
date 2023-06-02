# frozen_string_literal: true

require 'rails_helper'

describe 'rake cl2_back:destroy_excess_examples' do # rubocop:disable RSpec/DescribeClass
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['cl2_back:destroy_excess_examples'].reenable }

  let(:task) { Rake::Task['cl2_back:destroy_excess_examples'] }

  it 'only destroys excess campaign examples' do
    campaign1 = create(:admin_rights_received_campaign)
    create_list(:campaign_example, 5, campaign: campaign1)
    campaign2 = create(:comment_deleted_by_admin_campaign)
    create_list(:campaign_example, 3, campaign: campaign2)

    task.invoke('3', 'execute')

    expect(EmailCampaigns::Example.where(campaign: campaign1).count).to eq 3
    expect(EmailCampaigns::Example.where(campaign: campaign2).count).to eq 3
  end

  it 'only destroys the oldest examples of a campaign' do
    campaign = create(:admin_rights_received_campaign)
    younger_examples = create_list(:campaign_example, 3, campaign: campaign, created_at: Time.now)
    _older_examples = create_list(:campaign_example, 2, campaign: campaign, created_at: 1.week.ago)

    task.invoke('3', 'execute')

    expect(EmailCampaigns::Example.where(campaign: campaign).pluck(:id)).to match_array(younger_examples.pluck(:id))
  end

  it 'does not destroy campaign examples in dry_run mode' do
    campaign = create(:comment_deleted_by_admin_campaign)
    create_list(:campaign_example, 5, campaign: campaign)

    task.invoke('3')

    expect(EmailCampaigns::Example.where(campaign: campaign).count).to eq 5
  end
end
