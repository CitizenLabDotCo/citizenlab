# frozen_string_literal: true

module McpServer::BaseTool::Authorization
  extend ActiveSupport::Concern

  included do
    include Pundit::Authorization
  end

  private

  def pundit_user
    current_user
  end
end
