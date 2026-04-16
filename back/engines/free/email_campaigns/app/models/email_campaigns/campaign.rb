# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id                   :uuid             not null, primary key
#  type                 :string           not null
#  author_id            :uuid
#  enabled              :boolean
#  sender               :string
#  reply_to             :string
#  schedule             :jsonb
#  subject_multiloc     :jsonb
#  body_multiloc        :jsonb
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deliveries_count     :integer          default(0), not null
#  context_id           :uuid
#  title_multiloc       :jsonb
#  intro_multiloc       :jsonb
#  button_text_multiloc :jsonb
#  context_type         :string
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id   (author_id)
#  index_email_campaigns_campaigns_on_context_id  (context_id)
#  index_email_campaigns_campaigns_on_type        (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaign < ApplicationRecord
    include Imageable

    belongs_to :author, class_name: 'User', optional: true
    belongs_to :context, polymorphic: true, optional: true
    has_many :examples, class_name: 'EmailCampaigns::Example', dependent: :destroy

    # accepts_nested_attributes_for does not work for concerns
    # (see https://github.com/rails/rails/issues/15253). Doing
    # so results in a NoMethodError for text_images_attributes=.
    # Otherwise, we would include the part below in the
    # ContentConfigurable concern.
    has_many :text_images, as: :imageable, dependent: :destroy
    accepts_nested_attributes_for :text_images
    has_many_text_images from: :body_multiloc, as: :body_text_images
    has_many_text_images from: :intro_multiloc, as: :intro_text_images

    before_validation :set_enabled, on: :create

    validate :validate_recipients, on: :send
    validates :context_id, uniqueness: { scope: :type }, if: :unique_campaigns_per_context?

    scope :manual, -> { where type: DeliveryService.new.manual_campaign_types }
    scope :automatic, -> { where.not(type: DeliveryService.new.manual_campaign_types) }

    def self.filter(action_symbol)
      @filter_hooks ||= []
      @filter_hooks << action_symbol
    end

    def self.filter_hooks
      @filter_hooks || []
    end

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

    def self.supports_context?(_context)
      false
    end

    def apply_recipient_filters(activity: nil, time: nil)
      current_class = self.class

      users_scope = User.where.not(email: nil)
      while current_class <= ::EmailCampaigns::Campaign
        users_scope = current_class.recipient_filters.inject(users_scope) do |users_scope, action_symbol|
          send(action_symbol, users_scope, activity: activity, time: time)
        end

        current_class = current_class.superclass
      end

      users_scope
    end

    def run_filter_hooks(activity: nil, time: nil)
      result = true
      current_class = self.class

      while current_class <= ::EmailCampaigns::Campaign
        result &&= current_class.filter_hooks.all? do |action_symbol|
          send(action_symbol, activity: activity, time: time)
        end

        current_class = current_class.superclass
      end

      result
    end

    def run_before_send_hooks(command)
      current_class = self.class

      while current_class <= ::EmailCampaigns::Campaign
        current_class.before_send_hooks.each do |action_symbol|
          send(action_symbol, command)
        end

        current_class = current_class.superclass
      end
    end

    def run_after_send_hooks(command)
      current_class = self.class

      while current_class <= ::EmailCampaigns::Campaign
        current_class.after_send_hooks.each do |action_symbol|
          send(action_symbol, command)
        end
        current_class = current_class.superclass
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

    def manual?
      false
    end

    def activity_context(_activity)
      nil
    end

    def extra_mailgun_variables(_command)
      super || {}
    end

    def can_be_disabled?
      true
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

    def unique_campaigns_per_context?
      # This is the default value and can be overwritten by each campaign subclass.
      true
    end

    private

    def validate_recipients
      return if apply_recipient_filters.any?

      errors.add(:base, :no_recipients, message: "Can't send a campaign without recipients")
    end
  end
end
