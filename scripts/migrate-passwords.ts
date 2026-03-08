/**
 * Migration Script: Hash Existing Plain-Text Passwords
 * 
 * This script connects to both MongoDB databases (chemtronics and hydroworx)
 * and hashes all existing plain-text passwords using bcrypt.
 * 
 * Usage:
 * 1. Ensure .env file has MONGO_URI_CHEMTRONICS and MONGO_URI_HYDROWORX set
 * 2. Run: npx ts-node scripts/migrate-passwords.ts
 */

import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

interface User {
  _id: mongoose.Types.ObjectId;
  userName: string;
  password: string;
}

const SALT_ROUNDS = 10;

async function hashExistingPasswords(connectionUri: string, dbName: string) {
  console.log(`\n🔄 Connecting to ${dbName} database...`);
  
  const connection = await mongoose.createConnection(connectionUri).asPromise();
  console.log(`✅ Connected to ${dbName}`);

  const UserModel = connection.model('UserEntity', new mongoose.Schema({
    userName: String,
    password: String,
  }));

  const users = await UserModel.find() as unknown as User[];
  console.log(`📊 Found ${users.length} users in ${dbName}`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      console.log(`⏭️  Skipping ${user.userName} - already hashed`);
      skipped++;
      continue;
    }

    console.log(`🔐 Hashing password for user: ${user.userName}`);
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log(`✅ Migrated: ${user.userName}`);
    migrated++;
  }

  await connection.close();
  console.log(`\n📈 ${dbName} Migration Summary:`);
  console.log(`   - Migrated: ${migrated}`);
  console.log(`   - Skipped: ${skipped}`);
  console.log(`   - Total: ${users.length}`);
}

async function main() {
  const chemtronicsUri = process.env.MONGO_URI_CHEMTRONICS;
  const hydroworxUri = process.env.MONGO_URI_HYDROWORX;

  if (!chemtronicsUri || !hydroworxUri) {
    console.error('❌ Error: MONGO_URI_CHEMTRONICS and MONGO_URI_HYDROWORX must be set in .env');
    process.exit(1);
  }

  console.log('🚀 Starting password migration...');

  try {
    await hashExistingPasswords(chemtronicsUri, 'Chemtronics');
    await hashExistingPasswords(hydroworxUri, 'Hydroworx');
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
