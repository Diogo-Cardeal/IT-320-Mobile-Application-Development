import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

import { styles } from '../styles';

const MAP_DELTA = {
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const formatCoordinate = (value) =>
  typeof value === 'number' ? value.toFixed(5) : 'Waiting...';

const formatAccuracy = (value) =>
  typeof value === 'number' ? `${Math.round(value)} m` : 'Unknown';

const formatTime = (timestamp) =>
  timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Waiting...';

function ActionButton({ disabled, label, loading, onPress, variant = 'primary' }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        (disabled || loading) && styles.disabledButton,
        pressed && !disabled && !loading && styles.pressedButton,
      ]}
    >
      {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

function DataPill({ label, value }) {
  return (
    <View style={styles.dataPill}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

export default function GeoPhotoScreen() {
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [mediaPermission, setMediaPermission] = useState('idle');
  const [region, setRegion] = useState(null);
  const [photoPin, setPhotoPin] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);

  const mapMarker = useMemo(() => {
    if (photoPin) {
      return {
        latitude: photoPin.latitude,
        longitude: photoPin.longitude,
        title: 'Photo pin',
        description: 'Photo attached to this GPS location',
      };
    }

    if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        title: 'Current location',
        description: 'Live GPS coordinate from this device',
      };
    }

    return null;
  }, [location, photoPin]);

  const getLocation = useCallback(async () => {
    setError('');
    setIsLocating(true);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        setLocationPermission('denied');
        setError('Location services are turned off. Enable Location Services, then try again.');
        return;
      }

      // Ask for location permission before trying to read GPS coordinates.
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setLocationPermission('denied');
        setError(
          permission.canAskAgain
            ? 'Location permission was denied. Tap Try GPS Again and choose Allow to show your map pin.'
            : 'Location permission is blocked. Enable it in Settings to show your map pin.'
        );
        return;
      }

      setLocationPermission('granted');

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const nextRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        ...MAP_DELTA,
      };

      setLocation(currentLocation);
      setRegion(nextRegion);
    } catch (exception) {
      setError('Could not get your location. Check GPS signal and try again.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  const pickImage = useCallback(async () => {
    if (!location) {
      setError('Get a GPS location first, then attach a photo to that point.');
      return;
    }

    setError('');
    setIsPickingPhoto(true);

    try {
      // Ask for photo-library permission before opening the device media picker.
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        setMediaPermission('denied');
        setError(
          permission.canAskAgain
            ? 'Photo library permission was denied. Tap Pick Photo again and choose Allow.'
            : 'Photo library permission is blocked. Enable it in Settings to attach a photo.'
        );
        return;
      }

      setMediaPermission('granted');

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        exif: true,
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      const processedPhoto = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 900 } }],
        {
          compress: 0.82,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setPhotoPin({
        height: processedPhoto.height,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        pickedAt: Date.now(),
        sourceSize: `${asset.width} x ${asset.height}`,
        uri: processedPhoto.uri,
        width: processedPhoto.width,
      });
    } catch (exception) {
      setError('Could not pick or process that photo. Please try another image.');
    } finally {
      setIsPickingPhoto(false);
    }
  }, [location]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const showLocationLoading = isLocating && !region;
  const showLocationDenied = locationPermission === 'denied' && !region;
  const canPickPhoto = locationPermission === 'granted' && !!location && !isLocating;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Location + Photos</Text>
          <Text style={styles.title}>Geo Snap Map</Text>
          <Text style={styles.subtitle}>A photo pinned to the device location that captured it.</Text>
        </View>

        <View style={styles.mapFrame}>
          {showLocationLoading ? (
            <View style={styles.pendingState}>
              <ActivityIndicator color="#0f766e" size="large" />
              <Text style={styles.pendingTitle}>Waiting for GPS permission</Text>
              <Text style={styles.pendingText}>The map will center on your real location.</Text>
            </View>
          ) : null}

          {showLocationDenied ? (
            <View style={styles.pendingState}>
              <Text style={styles.pendingTitle}>Location unavailable</Text>
              <Text style={styles.pendingText}>{error}</Text>
              <ActionButton label="Try GPS Again" loading={isLocating} onPress={getLocation} />
            </View>
          ) : null}

          {region ? (
            <MapView
              loadingEnabled
              region={region}
              showsCompass
              showsMyLocationButton
              showsUserLocation={locationPermission === 'granted'}
              style={styles.map}
            >
              {mapMarker ? (
                <Marker
                  coordinate={{
                    latitude: mapMarker.latitude,
                    longitude: mapMarker.longitude,
                  }}
                  description={mapMarker.description}
                  pinColor="#0f766e"
                  title={mapMarker.title}
                />
              ) : null}
            </MapView>
          ) : null}
        </View>

        {error && !showLocationDenied ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Needs attention</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <ActionButton
            label={region ? 'Refresh GPS' : 'Get GPS'}
            loading={isLocating && !!region}
            onPress={getLocation}
            variant="secondary"
          />
          <ActionButton
            disabled={!canPickPhoto}
            label={mediaPermission === 'denied' ? 'Try Photo Again' : 'Pick Photo'}
            loading={isPickingPhoto}
            onPress={pickImage}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Live Device Data</Text>
          <View style={styles.dataGrid}>
            <DataPill label="Latitude" value={formatCoordinate(location?.coords.latitude)} />
            <DataPill label="Longitude" value={formatCoordinate(location?.coords.longitude)} />
            <DataPill label="Accuracy" value={formatAccuracy(location?.coords.accuracy)} />
            <DataPill label="Updated" value={formatTime(location?.timestamp)} />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Tagged Photo</Text>

          {photoPin ? (
            <View style={styles.photoLayout}>
              <Image source={{ uri: photoPin.uri }} style={styles.photo} />
              <View style={styles.photoDetails}>
                <Text style={styles.photoTitle}>Pinned at {formatTime(photoPin.pickedAt)}</Text>
                <Text style={styles.photoMeta}>Lat {formatCoordinate(photoPin.latitude)}</Text>
                <Text style={styles.photoMeta}>Lng {formatCoordinate(photoPin.longitude)}</Text>
                <Text style={styles.photoMeta}>
                  Resized to {photoPin.width} x {photoPin.height}
                </Text>
                <Text style={styles.photoMeta}>Original {photoPin.sourceSize}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPhoto}>
              <Text style={styles.emptyTitle}>No photo pinned yet</Text>
              <Text style={styles.emptyText}>Pick an image after GPS is ready.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
