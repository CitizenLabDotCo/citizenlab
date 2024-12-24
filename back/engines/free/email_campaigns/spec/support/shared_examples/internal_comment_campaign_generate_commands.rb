# frozen_string_literal: true

RSpec.shared_examples 'internal_comment_campaign_generate_commands' do
  let(:notification_activity) { create(:activity, item: notification, action: 'created') }
  let(:recipient) { notification_activity.item.recipient }
  let(:name_service) { UserDisplayNameService.new(AppConfiguration.instance, recipient) }

  it 'generates a command with the desired payload and tracked content' do
    command = campaign.generate_commands(
      recipient: recipient,
      activity: notification_activity
    ).first

    expect(
      command.dig(:event_payload, :initiating_user_first_name)
    ).to eq(notification.initiating_user.first_name)
    expect(
      command.dig(:event_payload, :initiating_user_last_name)
    ).to eq(notification.initiating_user.last_name)
    expect(
      command.dig(:event_payload, :internal_comment_author_name)
    ).to eq(name_service.display_name!(notification.internal_comment.author))
    expect(
      command.dig(:event_payload, :internal_comment_body)
    ).to eq(notification.internal_comment.body)
    expect(
      command.dig(:event_payload, :internal_comment_url)
    ).to eq(Frontend::UrlService.new.model_to_url(notification.internal_comment, locale: Locale.new(recipient.locale)))
    expect(
      command.dig(:event_payload, :post_title_multiloc)
    ).to eq(notification.idea.title_multiloc)
    expect(
      command.dig(:event_payload, :post_body_multiloc)
    ).to eq(notification.idea.body_multiloc)
    expect(
      command.dig(:event_payload, :post_image_medium_url)
    ).to eq(post_image.image.versions[:medium].url)
  end
end
