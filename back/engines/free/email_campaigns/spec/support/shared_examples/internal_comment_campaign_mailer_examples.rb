# frozen_string_literal: true

RSpec.shared_examples 'internal_comment_campaign_mailer_examples' do
  it 'renders the subject' do
    expect(mail.subject).to be_present
  end

  it 'renders the receiver email' do
    expect(mail.to).to eq([recipient.email])
  end

  it 'renders the sender email' do
    expect(mail.from).to all(end_with('@citizenlab.co'))
  end

  it 'assigns organisation name' do
    expect(body).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
  end

  it 'includes the comment author name' do
    expect(body).to include('Matthias')
  end

  it 'includes the comment body' do
    expect(body).to include('Wowzers!')
  end

  it 'includes the post title' do
    expect(body).to include('Permit paving')
  end

  it 'includes the post body text' do
    expect(body).to include('paving your front garden')
  end

  it 'includes the image url' do
    expect(body).to include(idea_image.image.versions[:medium].url)
  end

  context 'with custom text' do
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      campaign.update!(
        subject_multiloc: { 'en' => 'Custom Subject - {{ authorNameFull }}' },
        title_multiloc: { 'en' => 'NEW TITLE FOR {{ post }}' },
        intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
        button_text_multiloc: { 'en' => 'CLICK THE BUTTON - {{ firstName }}' }
      )
    end

    it 'can customise the subject' do
      expect(mail.subject).to eq 'Custom Subject - Matthias Geeke'
    end

    it 'can customise the title' do
      expect(mail_body(mail)).to include('NEW TITLE FOR Permit paving of front gardens')
    end

    it 'can customise the body including HTML' do
      expect(mail_body(mail)).to include('<b>NEW BODY TEXT</b>')
    end

    it 'can customise the cta button' do
      expect(mail_body(mail)).to include('CLICK THE BUTTON - Matthias')
    end
  end
end
