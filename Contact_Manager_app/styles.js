import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef2f7',
  },
  container: {
    flex: 1,
    padding: 18,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#5f6f89',
    fontSize: 15,
    marginTop: 4,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    color: '#172033',
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderColor: '#c7d0df',
    borderWidth: 1,
    borderRadius: 8,
    color: '#172033',
    fontSize: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fbfe',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1267e8',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  searchWrap: {
    marginBottom: 14,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#ffffff',
    borderColor: '#c7d0df',
    borderRadius: 8,
    borderWidth: 1,
    color: '#172033',
    fontSize: 16,
    paddingHorizontal: 14,
  },
  listSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  countText: {
    color: '#1267e8',
    fontSize: 15,
    fontWeight: '700',
  },
  contactRow: {
    alignItems: 'center',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#dff4ea',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  avatarText: {
    color: '#087443',
    fontSize: 17,
    fontWeight: '800',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '700',
  },
  contactPhone: {
    color: '#68778f',
    fontSize: 14,
    marginTop: 3,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#68778f',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default styles;
