# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Notifications' do
  explanation 'Messages from the platform to the user to inform on activities that may be of interest to him/her.'
  header 'Content-Type', 'application/json'

  before do
    @user = create(:user)
    header_token_for @user

    create_list(:comment_on_idea_you_follow, 3, recipient: @user)
    create_list(:comment_on_your_comment, 2, read_at: Time.now, recipient: @user)
  end

  get 'web_api/v1/notifications' do
    explanation 'Notifications are sorted by descending creation date'
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of notifications per page'
    end
    parameter :only_unread, 'Add this parameter if you only want to receive unread notifications'

    example_request 'List all notifications' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end

    example 'List all unread notifications' do
      do_request(only_unread: true)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map { |d| d.dig(:attributes, :read_at) }.uniq).to eq [nil]
      expect(json_response[:data].first.dig(:attributes, :initiating_user_slug)).to be_present
    end

    describe do
      example 'List all different types of notification', document: false do
        notification_classes = NotificationService.new.notification_classes

        notification_classes.each do |notification_class|
          create(notification_class.model_name.element.to_sym, recipient: @user)
        end

        do_request

        expect(response_data.pluck(:type).uniq)
          .to match_array(notification_classes.map { |klass| klass.name.demodulize.underscore })
      end
    end
  end

  get 'web_api/v1/notifications/:id' do
    let(:id) { Notification.first.id }

    example_request 'Get one notification by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq Notification.first.id
    end
  end

  post 'web_api/v1/notifications/mark_all_read' do
    example_request 'Mark all notifications as read' do
      explanation 'Returns all the notifications that have been changed'
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map { |d| d[:attributes][:read_at] }).not_to include nil
    end
  end

  post 'web_api/v1/notifications/:id/mark_read' do
    let(:notification1) { Notification.where(read_at: nil).first }
    let(:notification2) { Notification.where(read_at: nil).second }
    let(:id) { notification2.id }

    example_request 'Mark one notifications as read' do
      explanation 'Returns the notification'
      assert_status 200

      expect(notification1.reload.read_at).to be_nil
      expect(response_data[:id]).to eq notification2.id
      expect(response_data.dig(:attributes, :read_at)).not_to be_nil
    end
  end
end
