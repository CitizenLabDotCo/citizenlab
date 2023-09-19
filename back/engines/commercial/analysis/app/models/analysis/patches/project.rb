# frozen_string_literal: true

module Analysis::Patches::Project
  def self.included(base)
    base.class_eval do
      has_many :analyses, class_name: 'Analysis::Analysis', dependent: :destroy
    end
  end
end
