# frozen_string_literal: true

module PublicApi
  class FileAttachmentsFinder
    def initialize(scope, attachable_id: nil, attachable_type: nil)
      @scope = scope
      @attachable_id = attachable_id
      @attachable_type = attachable_type
    end

    def execute
      @scope
        .then { |scope| filter_by_attachable_type(scope) }
        .then { |scope| filter_by_attachable_id(scope) }
        .order(created_at: :desc)
    end

    private

    def filter_by_attachable_type(scope)
      return scope unless @attachable_type

      scope.where(attachable_type: @attachable_type)
    end

    def filter_by_attachable_id(scope)
      return scope unless @attachable_id

      scope.where(attachable_id: @attachable_id)
    end
  end
end
