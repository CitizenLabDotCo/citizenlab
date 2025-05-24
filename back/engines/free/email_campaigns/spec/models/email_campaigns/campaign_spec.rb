# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaign do
  describe 'validate context_id' do
    it 'is invalid if context_id is present && skip_context_absence is false' do
      campaign = build(:invite_received_campaign, context_id: SecureRandom.uuid)
      expect(campaign.send(:skip_context_absence?)).to be false
      expect(campaign).to be_invalid
    end
  end

  describe '#apply_recipient_filters' do
    let(:campaign) { create(:invite_received_campaign) }
    let(:invite) { create(:invite) }
    let(:activity) { create(:activity, item: invite, action: 'created', user: invite.inviter) }

    it 'excludes users with pending invite and no email' do
      invitee = create(:user, invite_status: 'pending', email: nil, first_name: 'test_name')
      invite2 = create(:invite, invitee_id: invitee.id)
      activity2 = create(:activity, item: invite2, action: 'created', user: invite2.inviter)

      result = campaign.apply_recipient_filters(activity: activity2)
      expect(result).not_to include invitee
      expect(result.count).to eq 0
    end
  end

  describe '#sanitize_body_multiloc' do
    before do
      # Mock the entire swap_data_images method to prevent image processing
      allow_any_instance_of(ContentImageService).to receive(:swap_data_images) do |_, content|
        content # Return content unchanged - let sanitizer handle it
      end
    end

    it 'sanitizes script tags in the body' do
      campaign = create(:manual_campaign, body_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(campaign.body_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end

    it 'sanitizes img tags in the body' do
      campaign = create(:manual_campaign, body_multiloc: {
        'en' => 'Something <img src=x onerror=alert(1)>'
      })
      expect(campaign.body_multiloc).to eq({ 'en' => 'Something <img src="x">' })
    end

    it 'sanitizes when escaped HTML tags present' do
      campaign = create(:manual_campaign, body_multiloc: {
        'en' => 'Something &lt;img src=x onerror=alert(1)&gt;'
      })
      expect(campaign.body_multiloc).to eq({ 'en' => 'Something <img src="x">' })
    end

    it "allows embedded youtube video's in the body" do
      campaign = create(:manual_campaign, body_multiloc: {
        'en' => '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/Bu2wNKlVRzE?showinfo=0" height="242.5" width="485" data-blot-formatter-unclickable-bound="true"></iframe>'
      })
      expect(campaign.body_multiloc).to eq({ 'en' => '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/Bu2wNKlVRzE?showinfo=0" height="242.5" width="485" data-blot-formatter-unclickable-bound="true"></iframe>' })
    end
  end

  describe '#sanitize_subject_multiloc' do
    it 'removes all HTML tags from subject_multiloc' do
      campaign = build(
        :manual_campaign,
        subject_multiloc: {
          'en' => 'Something <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      campaign.save!

      expect(campaign.subject_multiloc['en']).to eq('Something alert("XSS") something')
      expect(campaign.subject_multiloc['fr-BE']).to eq('Something ')
      expect(campaign.subject_multiloc['nl-BE']).to eq('Plain text with formatting')
    end

    it 'sanitizes when escaped HTML tags present' do
      campaign = create(:manual_campaign, subject_multiloc: {
        'en' => 'Something &lt;img src=x onerror=alert(1)&gt;'
      })
      expect(campaign.subject_multiloc).to eq({ 'en' => 'Something ' })
    end
  end
end
