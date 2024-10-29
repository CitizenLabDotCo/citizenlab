# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::EventRegistrationConfirmationMailer do
  describe 'campaign_mail' do
    let_it_be(:event) { create(:event, start_at: '2017-05-01 18:00', end_at: '2017-05-01 20:00') }
    let_it_be(:recipient) { create(:user, locale: 'en') }

    let(:event_attributes) { event.attributes }

    let(:event_payload) do
      {
        event_attributes: event_attributes,
        event_url: 'the-event-url',
        project_title_multiloc: { 'en' => 'project-en', 'la' => 'project-la' },
        project_url: 'the-project-url',
        image_url: 'the-image-url'
      }
    end

    let(:mail) do
      campaign = EmailCampaigns::Campaigns::EventRegistrationConfirmation.create!
      command = { recipient: recipient, event_payload: event_payload }
      described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now
    end

    it 'has the correct subject' do
      event_title = event_attributes['title_multiloc'][recipient.locale]
      expected_subject = "You're in! Your registration for \"#{event_title}\" is confirmed"
      expect(mail.subject).to eq expected_subject
    end

    it 'sends to email to the correct recipient' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'has the correct sender address' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'has the correct ics attachment' do
      freeze_time do
        expected_content = Events::IcsGenerator
          .new.generate_ics(event, recipient.locale)
          # Remove the UID line as a different one is generated when serializing the event.
          .gsub(/^UID:.*$/, '')

        content = mail
          .attachments['event.ics']
          .body.raw_source
          .gsub(/^UID:.*$/, '')

        expect(content).to eq(expected_content)
      end
    end

    describe 'body' do
      let(:page) do
        body = mail.html_part.body.decoded
        Capybara::Node::Simple.new(body)
      end

      it 'contains the correct header' do
        # Check for presence of:
        #   <div> Lucille, thanks for registering for: </div>
        #   <div ...> Info session </div>
        first_div = page.find(
          'div',
          exact_text: /\s*#{recipient.first_name}, thanks for registering for\s*/
        )

        event_title = event_attributes['title_multiloc'][recipient.locale]
        expect(first_div).to have_css('+ div', text: event_title)
      end

      it 'has a "View the event" button with the correct link' do
        event_url = event_payload[:event_url]
        expect(page).to have_css(%(a[href="#{event_url}"]), text: 'View the event')
      end

      it 'has an "Add to calendar" button with the correct link' do
        href = "http://example.org/web_api/v1/events/#{event_attributes['id']}.ics"
        expect(page).to have_css(%(a[href="#{href}"]), text: 'Add to your calendar')
      end

      it 'contains a link to the project' do
        # Check for presence of:
        #   <div> Project </div>
        #   <div ...>
        #     <a ... href="%project_url%" ...> %project title% </a>
        #   </div>
        label_div = page.find('div', exact_text: /\s*Project\s*/)

        expect(label_div).to have_css(
          %(+ div a[href="#{event_payload[:project_url]}"]),
          text: event_payload[:project_title_multiloc][recipient.locale]
        )
      end

      it 'contains time details in the platform timezone' do
        # Check for presence of:
        # <div> Date </div>
        # <div style="font-weight: 400;"> 01 May 20:00 – 01 May 22:00 </div>
        # Timezone of test platform is CEST = 2 hours ahead of UTC (the date specified in :event)
        label_div = page.find('div', exact_text: /\s*Date\s*/)
        expect(label_div).to have_css('+ div', text: '01 May 20:00 – 01 May 22:00')
      end

      context 'when the event has a location' do
        let(:address_1) { 'address-1' } # rubocop:disable Naming/VariableNumber
        let(:address_2_multiloc) { { 'en' => 'address-2-en', 'la' => 'address-2-la' } }

        before do
          event_attributes[:address_1] = address_1 # rubocop:disable Naming/VariableNumber
          event_attributes[:address_2_multiloc] = address_2_multiloc
        end

        it 'contains location details' do
          label_div = page.find('div', exact_text: /\s*Location\s*/)
          location_div = label_div.find('+ div')

          expect(location_div).to have_text(address_1)
          expect(location_div).to have_text(address_2_multiloc[recipient.locale])
        end
      end

      context 'when the event has no location' do
        it 'does not contain location details' do
          expect(page).not_to have_css('div', text: /\s*Location\s*/)
        end
      end

      context 'when the event has no description' do
        before do
          event_attributes['description_multiloc'] = {}
        end

        it 'does not contain the description' do
          # Sanity check
          expect(event_attributes['description_multiloc']).to be_blank

          expect(page).not_to have_css('div', text: /\s*Description\s*/)
        end
      end
    end
  end
end
