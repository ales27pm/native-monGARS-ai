
platform :ios, '14.0'

require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'monGARS' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => true,
    :app_path => "../"
  )

  pod 'ExpoModulesCore'
  pod 'RNPermissions', :path => '../node_modules/react-native-permissions'

  # Add Core ML / MLX / Tokenizers dependencies if needed
  pod 'swift-tokenizers', :git => 'https://github.com/huggingface/swift-tokenizers.git'
  pod 'SWCompression', :git => 'https://github.com/tsolomko/SWCompression.git'

  target 'monGARSTests' do
    inherit! :complete
    # Pods for testing
  end

  post_install do |installer|
    react_native_post_install(installer)
  end
end

// ===== End of File: {label} =====

