class ApplicationController < ActionController::API
  include Knock::Authenticable
  include Pundit
  include Finder::Pundit

  before_action :authenticate_user, if: :secure_controller?
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  rescue_from ActiveRecord::RecordNotFound, with: :send_not_found

  rescue_from ActionController::UnpermittedParameters do |pme|
    render json: { error:  { unknown_parameters: pme.params } },
      status: :bad_request
  end

  rescue_from ClErrors::TransactionError, with: :transaction_error

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # all controllers are secured by default
  def secure_controller?
    true
  end

  def send_success(data=nil, status=200)
    render json: data, status: status
  end

  def send_error(error=nil, status=400)
    render json: error, status: status
  end

  def send_not_found(error=nil)
    if error.nil?
      head 404, "content_type" => 'text/plain'
    else
      render json: error, status: 404
    end
  end

  def send_no_content(status=204)
    head status
  end

  def transaction_error(exception)
    render json: { errors: { base: [{ error: exception.error_key, message: exception.message }] } }, status: exception.code
  end

  def user_not_authorized
    render json: { errors: { base: [{ error: 'Unauthorized!' }] } }, status: :unauthorized
  end

  # Used by semantic logger to include in every log line
  def append_info_to_payload(payload)
    super
    payload[:tenant_id] = Current.tenant&.id
    payload[:user_id] = current_user&.id
    payload[:request_id] = request.request_id
    payload[:"X-Amzn-Trace-Id"] = request.headers["X-Amzn-Trace-Id"]
  end

  def fastjson_params(extra_params = {})
    { current_user: current_user, **extra_params.symbolize_keys }
  end

  def linked_json collection, serializer, options={}
    {
      **serializer.new(collection, options).serializable_hash,
      links: page_links(collection)
    }
  end

  def page_links collection
    # Inspired by https://github.com/davidcelis/api-pagination/blob/master/lib/grape/pagination.rb
    pages = ApiPagination.send :pages_from, collection
    links = pages.transform_values &method(:build_link)
    links[:self] = build_link collection.current_page
    links[:first] ||= build_link 1
    links[:last] ||= build_link [collection.total_pages, 1].max
    [:prev, :next].each do |key|
      links[key] ||= nil
    end

    links
  end

  private

  def build_link number
    # Inspired by https://github.com/davidcelis/api-pagination/blob/master/lib/grape/pagination.rb
    url = request.url.sub(/\?.*$/, '')
    pageparams = Rack::Utils.parse_nested_query(request.query_string)
    pageparams['page'] ||= {}
    pageparams['page']['number'] = number
    "#{url}?#{pageparams.to_param}"
  end
end
