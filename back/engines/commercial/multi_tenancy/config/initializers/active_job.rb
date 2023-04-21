# frozen_string_literal: true

require 'multi_tenancy/patches/active_job/base'

ActiveJob::Base.prepend(MultiTenancy::Patches::ActiveJob::Base)
