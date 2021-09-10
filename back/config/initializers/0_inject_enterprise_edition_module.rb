# frozen_string_literal: true

require 'active_support/inflector'

# Helpers to inject Enterprise-edition features.
# Originally, taken from:
# https://gitlab.com/gitlab-org/gitlab-foss/-/blob/master/config/initializers/0_inject_enterprise_edition_module.rb
module InjectEnterpriseEditionModule
  def prepend_if_ee(constant, with_descendants: false)
    prepend_module(constant.constantize, with_descendants) if CitizenLab.ee?
  end

  def extend_if_ee(constant)
    extend(constant.constantize) if CitizenLab.ee?
  end

  def include_if_ee(constant)
    include(constant.constantize) if CitizenLab.ee?
  end

  private

  def prepend_module(mod, with_descendants)
    prepend(mod)
    descendants.each { |descendant| descendant.prepend(mod) } if with_descendants
  end
end

Module.prepend(InjectEnterpriseEditionModule)
