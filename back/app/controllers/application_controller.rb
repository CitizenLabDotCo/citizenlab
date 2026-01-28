# frozen_string_literal: true

class ApplicationController < ActionController::API
  include AuthToken::Authenticable
  include Pundit::Authorization
  include ActionController::Cookies

  class FeatureRequiredError < StandardError
    attr_reader :feature

    def initialize(feature)
      super()
      @feature = feature
    end
  end

  before_action :authenticate_user
  before_action :set_policy_context
  before_action :set_current_location_headers

  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  rescue_from ActiveRecord::RecordNotFound, with: :send_not_found

  rescue_from ActionController::UnpermittedParameters do |pme|
    render json: { error: { unknown_parameters: pme.params } },
      status: :bad_request
  end

  rescue_from ClErrors::TransactionError, with: :transaction_error

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  rescue_from FeatureRequiredError, with: :feature_required_error

  # +pundit_user+ is overridden to be able to embed additional context in the +user+
  # object passed to policies. It is meant to be used with policies that inherit from
  # +ApplicationPolicy+, which includes all the necessary utilities to parse this *special
  # user* seamlessly. In these policies, the +current_user+ can still be accessed as
  # +user+ and the context can be accessed as `context`.
  # @return [ApplicationPolicy::UserContext]
  def pundit_user
    ::ApplicationPolicy::UserContext.new(current_user, policy_context)
  end

  # This method can be used to populate the context (hash) that is passed by default to
  # all policies instantiated in controllers that inherit from this class. You can add
  # context by adding keys to the hash.
  # @example
  #   # In the controller:
  #   policy_context[:foo] = 'bar'
  #
  #   # In the policy:
  #   def show?
  #    user.admin? && context[:foo] == 'bar'
  #   end
  # @see ApplicationController#pundit_user for more details.
  # @see ApplicationController#set_policy_context for an usage example.
  # @return [Hash]
  def policy_context
    @policy_context ||= {}
  end

  def send_error(error = nil, status = 400)
    render json: error, status: status
  end

  def send_not_found(error = nil)
    if error.nil?
      head :not_found, 'content_type' => 'text/plain'
    else
      render json: error, status: :not_found
    end
  end

  def send_unprocessable_entity(record)
    render json: { errors: record.errors.details }, status: :unprocessable_entity
  end

  def transaction_error(exception)
    render json: { errors: { base: [{ error: exception.error_key, message: exception.message }] } }, status: exception.code
  end

  # @param [Pundit::NotAuthorized] exception
  def user_not_authorized(exception)
    if current_user&.blocked?
      render json: { errors: { base: [{ error: 'blocked', details: { block_end_at: current_user.block_end_at } }] } },
        status: :unauthorized
    else
      reason = exception.try(:reason) || 'Unauthorized!'
      render json: { errors: { base: [{ error: reason }] } }, status: :unauthorized
    end
  end

  def feature_required_error(exception)
    skip_authorization
    render json: { errors: { base: [{ error: "#{exception.feature}_disabled" }] } }, status: :unauthorized
  end

  # Used by semantic logger to include in every log line
  def append_info_to_payload(payload)
    super
    payload[:tenant_id] = Tenant.safe_current&.id
    payload[:tenant_host] = Tenant.safe_current&.host
    payload[:user_id] = current_user&.id
    payload[:request_id] = request.request_id
    payload[:'X-Amzn-Trace-Id'] = request.headers['X-Amzn-Trace-Id']
  end

  def jsonapi_serializer_params(extra_params = {})
    {
      current_user: current_user,
      user_context: pundit_user,
      **extra_params.symbolize_keys
    }
  end

  def raw_json(json, type: nil)
    type ||= action_name
    {
      data: {
        type: type,
        attributes: json
      }
    }
  end

  def linked_json(collection, serializer, options = {})
    {
      **serializer.new(collection, options).serializable_hash,
      links: page_links(collection)
    }
  end

  # Sub-optimal performance, since we are instantiating a serializer for each record.
  # Since we currently (2020-05-19) only use this for notifications, and we rarely process very large numbers
  # of notifications, we are not overly concerned by this.
  # If performance becomes an issue, we could try patching or recreating the approach used by a fork of a similar gem:
  # https://github.com/dvandersluis/fast_jsonapi/tree/heterogeneous-collection
  # Better still, we can hopefully one day use a new version of the jsonapi-serializer gem that supports this
  # 'out of the box', or switch to a different gem that does.
  def serialize_heterogeneous_collection(collection, serializers, options = {})
    serializers = serializers.to_proc

    collection.map do |record|
      serializer_class = serializers.call(record.class)
      serializer_class.new(record, **options, params: jsonapi_serializer_params).serializable_hash[:data]
    end
  end

  def page_links(collection)
    # Inspired by https://github.com/davidcelis/api-pagination/blob/master/lib/grape/pagination.rb
    pages = ApiPagination.send :pages_from, collection
    links = pages.transform_values { |number| build_link(number) }
    links[:self] = build_link collection.current_page
    links[:first] ||= build_link 1
    links[:last] ||= build_link [collection.total_pages, 1].max
    %i[prev next].each do |key|
      links[key] ||= nil
    end

    links
  end

  def parse_bool(value)
    ActiveModel::Type::Boolean.new.cast(value)
  end

  def require_feature!(feature)
    raise FeatureRequiredError, feature if !AppConfiguration.instance.feature_activated?(feature)
  end

  private

  def build_link(number)
    # Inspired by https://github.com/davidcelis/api-pagination/blob/master/lib/grape/pagination.rb
    url = request.url.sub(/\?.*$/, '')
    pageparams = Rack::Utils.parse_nested_query(request.query_string)
    pageparams['page'] ||= {}
    pageparams['page']['number'] = number
    "#{url}?#{pageparams.to_param}"
  end

  def paginate(collection)
    collection
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
  end

  def remove_image_if_requested!(resource, resource_params, image_field_name)
    return unless resource_params.key?(image_field_name) && resource_params[image_field_name].nil?

    # setting the image attribute to nil will not remove the image
    resource.public_send(:"remove_#{image_field_name}!")
  end

  def set_policy_context
    project_preview_token = cookies[:preview_token]
    if project_preview_token && AppConfiguration.instance.feature_activated?('project_preview_link')
      policy_context[:project_preview_token] = project_preview_token
    end
  end

  def set_current_location_headers
    Current.location_headers = ParticipationLocationService.extract_location_headers(request.headers)
  end
end

ApplicationController.include(AggressiveCaching::Patches::ApplicationController)
