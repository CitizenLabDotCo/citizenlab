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
    expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
  end

  it 'includes the comment author name' do
    expect(mail.body.encoded).to include('Matthias')
  end

  it 'includes the comment body' do
    expect(mail.body.encoded).to include('Wowzers!')
  end

  it 'includes the post title' do
    expect(mail.body.encoded).to include('Permit paving')
  end

  it 'includes the post body text' do
    expect(mail.body.encoded).to include('paving your front garden')
  end

  it 'includes the image url' do
    expect(mail.body.encoded).to include(idea_image.image.versions[:medium].url)
  end
end
