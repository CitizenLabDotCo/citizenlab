# frozen_string_literal: true

module Files
  class TranscriptPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.joins(:file).where(files: { id: FilePolicy::Scope.new(user, Files::File).resolve })
      end
    end

    def show?
      FilePolicy.new(user, record.file).show?
    end
  end
end
