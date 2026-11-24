# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationController do
  controller do
    skip_before_action :authenticate_user
    skip_after_action :verify_policy_scoped

    def index
      case params[:error]
      when 'null_byte' then raise ArgumentError, 'string contains null byte'
      when 'other' then raise ArgumentError, 'something else'
      when 'wrapped_not_found'
        begin
          raise ActiveRecord::RecordNotFound
        rescue ActiveRecord::RecordNotFound
          raise ArgumentError, 'something else'
        end
      end
    end
  end

  describe 'ArgumentError handling' do
    it 'returns 400 for a null byte error' do
      get :index, params: { error: 'null_byte' }
      expect(response).to have_http_status(:bad_request)
    end

    it 're-raises other ArgumentErrors' do
      expect { get :index, params: { error: 'other' } }
        .to raise_error(ArgumentError, 'something else')
    end

    it 'still uses the handler for the cause of other ArgumentErrors' do
      get :index, params: { error: 'wrapped_not_found' }
      expect(response).to have_http_status(:not_found)
    end
  end
end
