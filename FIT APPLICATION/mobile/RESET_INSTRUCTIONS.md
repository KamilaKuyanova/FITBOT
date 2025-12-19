# Инструкция по сбросу состояния приложения

Чтобы увидеть экраны Onboarding и Авторизации заново, выполните одно из следующих действий:

## Вариант 1: Удалить приложение (рекомендуется)
1. Удалите приложение с устройства/эмулятора
2. Переустановите через `npx expo start`
3. При первом запуске покажутся экраны Onboarding → Auth → Main

## Вариант 2: Очистить AsyncStorage (в коде)
Добавьте в консоль разработчика:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear();
```

## Вариант 3: Использовать Logout
1. Откройте Profile
2. Нажмите "Sign Out"
3. После logout покажется экран Auth (но не Onboarding, т.к. он уже пройден)

## Порядок экранов:
1. **Onboarding** - показывается если `hasOnboarded === false`
2. **Auth (Login/Sign Up)** - показывается если `hasOnboarded === true` и `isAuthenticated === false`
3. **Main App** - показывается если `isAuthenticated === true`

