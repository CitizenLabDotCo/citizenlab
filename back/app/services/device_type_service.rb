# frozen_string_literal: true

# The device category of a user agent parsed by the Browser gem, shared by
# impact tracking sessions and participation device tracking so that both
# report the same categories.
class DeviceTypeService
  def self.device_type(browser)
    return 'mobile' if browser.device.mobile?
    return 'tablet' if browser.device.tablet?

    'desktop_or_other'
  end
end
