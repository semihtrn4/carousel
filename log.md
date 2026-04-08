Run sed -i 's/kotlinVersion = "[0-9.]*"/kotlinVersion = "2.0.21"/' android/build.gradle
  sed -i 's/kotlinVersion = "[0-9.]*"/kotlinVersion = "2.0.21"/' android/build.gradle
  grep "kotlinVersion" android/build.gradle
  shell: /usr/bin/bash -e {0}
  env:
    JAVA_HOME: /opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/17.0.18-8/x64
    JAVA_HOME_17_X64: /opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/17.0.18-8/x64
    ANDROID_HOME: /usr/local/lib/android/sdk
    ANDROID_SDK_ROOT: /usr/local/lib/android/sdk
Error: Process completed with exit code 1.