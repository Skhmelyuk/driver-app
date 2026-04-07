import { StyleSheet } from 'react-native';

export const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSpacer: {
    height: 40,
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#969696',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7900FF',
    height: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
});
