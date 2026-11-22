const CATEGORIES = [
  'id_card',
  'wallet',
  'phone',
  'keys',
  'books',
  'bag',
  'electronics',
  'documents',
  'other'
];

const LOCATIONS = [
  'Library',
  'Hostel A',
  'Hostel B',
  'Canteen',
  'Main Gate',
  'Sports Complex',
  'Auditorium',
  'Science Block',
  'Computer Lab',
  'Cafeteria',
  'Other'
];

const ITEM_TYPES = ['lost', 'found'];
const ITEM_STATUSES = ['open', 'matched', 'claimed', 'recovered', 'archived'];
const USER_ROLES = ['user', 'admin'];
const CLAIM_STATUSES = ['pending', 'approved', 'rejected'];

module.exports = {
  CATEGORIES,
  LOCATIONS,
  ITEM_TYPES,
  ITEM_STATUSES,
  USER_ROLES,
  CLAIM_STATUSES
};
