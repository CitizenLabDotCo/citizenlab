# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id               :uuid             not null, primary key
#  type             :string           not null
#  author_id        :uuid
#  enabled          :boolean
#  sender           :string
#  reply_to         :string
#  schedule         :jsonb
#  subject_multiloc :jsonb
#  body_multiloc    :jsonb
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  deliveries_count :integer          default(0), not null
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id  (author_id)
#  index_email_campaigns_campaigns_on_type       (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaign < ApplicationRecord
    belongs_to :author, class_name: 'User', optional: true
    has_many :examples, class_name: 'EmailCampaigns::Example', dependent: :destroy

    # accepts_nested_attributes_for does not work for concerns
    # (see https://github.com/rails/rails/issues/15253). Doing
    # so results in a NoMethodError for text_images_attributes=.
    # Otherwise, we would include the part below in the
    # ContentConfigurable concern.
    has_many :text_images, as: :imageable, dependent: :destroy
    accepts_nested_attributes_for :text_images

    before_validation :set_enabled, on: :create

    def self.before_send(action_symbol)
      @before_send_hooks ||= []
      @before_send_hooks << action_symbol
    end

    def self.before_send_hooks
      @before_send_hooks || []
    end

    def self.after_send(action_symbol)
      @after_send_hooks ||= []
      @after_send_hooks << action_symbol
    end

    def self.after_send_hooks
      @after_send_hooks || []
    end

    def self.recipient_filter(action_symbol)
      @recipient_filters ||= []
      @recipient_filters << action_symbol
    end

    def self.recipient_filters
      @recipient_filters || []
    end

    def self.campaign_name
      name.split('::').last.underscore
    end

    def self.from_campaign_name(name)
      "EmailCampaigns::Campaigns::#{name.camelize}"
    end

    def self.recipient_role_multiloc_key; end

    def self.recipient_segment_multiloc_key; end

    def self.content_type_multiloc_key; end

    def self.trigger_multiloc_key; end

    def apply_recipient_filters(activity: nil, time: nil)
      self.class.recipient_filters.inject(User.where.not(email: nil)) do |users_scope, action_symbol|
        send(action_symbol, users_scope, { activity: activity, time: time })
      end
    end

    def run_before_send_hooks(activity: nil, time: nil)
      self.class.before_send_hooks.all? do |action_symbol|
        send(action_symbol, { activity: activity, time: time })
      end
    end

    def run_after_send_hooks(command)
      self.class.after_send_hooks.each do |action_symbol|
        send(action_symbol, command)
      end
    end

    def self.campaign_description_multiloc
      @multiloc_service ||= MultilocService.new
      @multiloc_service.i18n_to_multiloc(
        "email_campaigns.campaign_type_description.#{campaign_name}"
      )
    end

    def self.policy_class
      CampaignPolicy
    end

    protected

    def set_enabled
      self.enabled = true if enabled.nil?
    end

    def serialize_campaign(item)
      serializer = "#{self.class.name}Serializer".constantize
      ActiveModelSerializers::SerializableResource.new(item, {
        serializer: serializer,
        adapter: :json
      }).serializable_hash
    end
  end
end
