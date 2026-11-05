# frozen_string_literal: true

# Codes are generated with 6 digits. 4 is accepted only so that codes sent before the
# switch stay usable until they expire (Confirmation::CODE_DURATION); drop it after that.
USER_CONFIRMATION_CODE_PATTERN = /\A(?:[0-9]{4}|[0-9]{6})\z/
