# Animated Performance App

Expo React Native app for an assignment on the Animated API and list performance.

## What it demonstrates

- `Animated.Value` driven by `Animated.timing()`
- `useNativeDriver: true` on every animation
- `interpolate()` mapping animated values onto `scaleX`, `translateX`, `opacity`, and `scale`
- A virtualized `FlatList` with more than 10 rows
- `React.memo()` to avoid unnecessary list row re-renders
- A restart button that resets the animation and starts it again
- A JS-thread stress button so the native-driver animation can keep moving

## Run

```bash
npm install
npm run start
```

## Lint

```bash
npm run lint
```
