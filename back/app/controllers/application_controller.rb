# frozen_string_literal: true

class ApplicationController < ActionController::API
  include Knock::Authenticable
  include Pundit

  before_action :authenticate_user

  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  rescue_from ActiveRecord::RecordNotFound, with: :send_not_found

  rescue_from ActionController::UnpermittedParameters do |pme|
    render json: { error: { unknown_parameters: pme.params } },
      status: :bad_request
  end

  rescue_from ClErrors::TransactionError, with: :transaction_error

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

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
      reason = exception.reason || 'Unauthorized!'
      render json: { errors: { base: [{ error: reason }] } }, status: :unauthorized
    end
  end

  # Used by semantic logger to include in every log line
  def append_info_to_payload(payload)
    super
    payload[:tenant_id] = Current.tenant&.id
    payload[:tenant_host] = Current.tenant&.host
    payload[:user_id] = current_user&.id
    payload[:request_id] = request.request_id
    payload[:'X-Amzn-Trace-Id'] = request.headers['X-Amzn-Trace-Id']
  end

  def jsonapi_serializer_params(extra_params = {})
    { current_user: current_user, **extra_params.symbolize_keys }
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

  def serialize_heterogeneous_collection(collection)
    collection.map { |object| serialize_by_type(object) }
  end

  # This will only work if the serializer for the object is in the WebApi::V1 namespace,
  # is named <Module::Class>Serializer, and the object has type: '<Module::Class>' in its attributes.
  def serialize_by_type(object)
    serializer_class = "WebApi::V1::#{object.type}Serializer".constantize
    serializer_class.new(object, params: jsonapi_serializer_params).serializable_hash[:data]
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
    collection.page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
  end

  def remove_image_if_requested!(resource, resource_params, image_field_name)
    return unless resource_params.key?(image_field_name) && resource_params[image_field_name].nil?

    # setting the image attribute to nil will not remove the image
    resource.public_send("remove_#{image_field_name}!")
  end
end
