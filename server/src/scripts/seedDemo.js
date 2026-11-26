require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');
const Match = require('../models/Match');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const { findMatches } = require('../services/matcher');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostx';

async function seedDemoData() {
  try {
    console.log('Connecting to MongoDB for demo data seed...');
    await mongoose.connect(MONGO_URI);

    console.log('Cleaning up existing demo data...');
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Match.deleteMany({}),
      Claim.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const userPassHash = await bcrypt.hash('Password123!', salt);
    const adminPassHash = await bcrypt.hash('@Admin123', salt);

    const [admin, alice, bob] = await User.create([
      {
        name: 'Campus Administrator',
        email: 'admin@lostx.campus',
        passwordHash: adminPassHash,
        role: 'admin'
      },
      {
        name: 'Alice Smith',
        email: 'alice@campus.edu',
        passwordHash: userPassHash,
        role: 'user'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@campus.edu',
        passwordHash: userPassHash,
        role: 'user'
      }
    ]);

    console.log('Creating demo items (lost and found)...');
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    const itemsData = [
      // 1. Found Wallet (by Bob)
      {
        type: 'found',
        title: 'Black Leather Fossil Wallet',
        category: 'wallet',
        description: 'Found a black bi-fold leather wallet lying on a desk in the reading room.',
        location: 'Library',
        date: daysAgo(1),
        privateDetails: 'Contains student ID card ending in 4921 and two ₹500 notes inside the zipper coin pocket.',
        handoverInfo: 'Submitted to Library Reception Desk 2 (Staff: Mr. Sharma).',
        status: 'open',
        reportedBy: bob._id
      },
      // 2. Lost Wallet (by Alice) -> Match with Bob's found wallet!
      {
        type: 'lost',
        title: 'Black Fossil Leather Wallet',
        category: 'wallet',
        description: 'Lost my black Fossil wallet in the library reading room yesterday afternoon.',
        location: 'Library',
        date: daysAgo(1),
        status: 'open',
        reportedBy: alice._id
      },
      // 3. Lost Electronics (Alice)
      {
        type: 'lost',
        title: 'Apple AirPods Pro 2 in Spigen Case',
        category: 'electronics',
        description: 'White AirPods Pro 2 in a rugged black Spigen case. Left behind during the guest lecture.',
        location: 'Auditorium',
        date: daysAgo(2),
        status: 'open',
        reportedBy: alice._id
      },
      // 4. Found Electronics (Bob) -> Match with Alice's AirPods!
      {
        type: 'found',
        title: 'AirPods Pro Case and Earbuds',
        category: 'electronics',
        description: 'Found Apple AirPods in a black rugged case near row G seat 14.',
        location: 'Auditorium',
        date: daysAgo(2),
        privateDetails: 'Case has a small green lanyard attached and engraving on the lid.',
        handoverInfo: 'Kept at Auditorium Control Room with technician.',
        status: 'open',
        reportedBy: bob._id
      },
      // 5. Lost ID Card (Bob)
      {
        type: 'lost',
        title: 'Campus Student ID Card',
        category: 'id_card',
        description: 'Lost my blue lanyard with student ID card near the main entry security gates.',
        location: 'Main Gate',
        date: daysAgo(3),
        status: 'open',
        reportedBy: bob._id
      },
      // 6. Found ID Card (Alice) -> Match with Bob's ID Card!
      {
        type: 'found',
        title: 'Student ID Card with Blue Lanyard',
        category: 'id_card',
        description: 'Found a student ID card on a blue lanyard on the turnstile barrier.',
        location: 'Main Gate',
        date: daysAgo(3),
        privateDetails: 'Student name is Bob Johnson, CS Department roll number.',
        handoverInfo: 'Handed over to Main Gate Security Post.',
        status: 'open',
        reportedBy: alice._id
      },
      // 7. Lost Keys (Alice)
      {
        type: 'lost',
        title: 'Honda Bike Keys with Red Carabiner',
        category: 'keys',
        description: 'Set of 3 keys on a metallic red carabiner ring. Lost near basketball court.',
        location: 'Sports Complex',
        date: daysAgo(4),
        status: 'open',
        reportedBy: alice._id
      },
      // 8. Found Keys (Bob) -> Match with Alice's keys!
      {
        type: 'found',
        title: 'Bike Keys on Red Carabiner',
        category: 'keys',
        description: 'Found key ring with a bike key on the bleachers next to the basketball court.',
        location: 'Sports Complex',
        date: daysAgo(4),
        privateDetails: 'Has a small silver whistle attached and 3 keys total.',
        handoverInfo: 'Sports Complex Reception counter.',
        status: 'open',
        reportedBy: bob._id
      },
      // 9. Lost Laptop (Bob)
      {
        type: 'lost',
        title: 'MacBook Air M2 Silver 13-inch',
        category: 'electronics',
        description: 'Silver MacBook in dark grey felt sleeve forgotten on lab workbench 4.',
        location: 'Computer Lab',
        date: daysAgo(5),
        status: 'open',
        reportedBy: bob._id
      },
      // 10. Found Water Bottle (Alice)
      {
        type: 'found',
        title: 'Blue Hydro Flask 32oz',
        category: 'other',
        description: 'Cobalt blue insulated bottle left on the central dining table.',
        location: 'Canteen',
        date: daysAgo(2),
        privateDetails: 'Contains stickers from ReactConf and GitHub.',
        handoverInfo: 'Canteen token counter shelf.',
        status: 'open',
        reportedBy: alice._id
      },
      // 11. Lost Books (Alice)
      {
        type: 'lost',
        title: 'Database System Concepts Textbook',
        category: 'books',
        description: 'Silberschatz 7th edition hardcover with sticky notes on Chapter 4.',
        location: 'Library',
        date: daysAgo(6),
        status: 'open',
        reportedBy: alice._id
      },
      // 12. Recovered item demo (Bob)
      {
        type: 'found',
        title: 'Brown Leather Messenger Bag',
        category: 'bag',
        description: 'Found in the Science Block hallway near lecture hall 101.',
        location: 'Science Block',
        date: daysAgo(10),
        privateDetails: 'Contained notebook with physics diagrams.',
        handoverInfo: 'Returned to rightful owner.',
        status: 'recovered',
        reportedBy: bob._id
      }
    ];

    const createdItems = [];
    for (const data of itemsData) {
      const item = await Item.create(data);
      createdItems.push(item);
    }

    console.log(`Created ${createdItems.length} demo items. Running matcher engine...`);

    // Run matcher for each item
    for (const item of createdItems) {
      await findMatches(item);
    }

    // Now create a demo pending claim on Bob's found wallet from Alice!
    const foundWallet = createdItems[0];
    const lostWallet = createdItems[1];

    console.log('Creating demo claim for testing verification...');
    const demoClaim = await Claim.create({
      foundItem: foundWallet._id,
      claimant: alice._id,
      lostItem: lostWallet._id,
      proofText: 'The wallet is a black leather Fossil bi-fold. Inside the zippered compartment there are two ₹500 notes, and my student ID card is in the front window slot ending in 4921.',
      status: 'pending'
    });

    // Notify finder about the claim
    await Notification.create({
      user: bob._id,
      message: `Alice Smith submitted a verification claim for your found item "${foundWallet.title}".`,
      link: `/items/${foundWallet._id}`
    });

    console.log('\n===========================================');
    console.log('Demo Data Seed Completed Successfully!');
    console.log('===========================================');
    console.log('Demo Accounts:');
    console.log('1. Admin:  admin@lostx.campus   / Admin@12345');
    console.log('2. User 1: alice@campus.edu     / Password123!');
    console.log('3. User 2: bob@campus.edu       / Password123!');
    console.log(`Total Items: ${createdItems.length}`);
    console.log(`Demo Claim ID: ${demoClaim._id} (Pending Alice -> Bob's found wallet)`);
    console.log('===========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed demo data:', err);
    process.exit(1);
  }
}

seedDemoData();
