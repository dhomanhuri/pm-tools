/**
 * Script untuk membuat user dummy menggunakan Supabase Admin API
 * 
 * Cara menggunakan:
 * 1. Set environment variables:
 *    export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *    export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 * 
 * 2. Jalankan: node scripts/create-dummy-users.mjs
 * 
 * Atau langsung:
 * NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-dummy-users.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Get from environment variables first, fallback to hardcoded (for development only)
const SUPABASE_URL = "https://zkoablwxosnihhmuilnc.supabase.co";

// IMPORTANT: Replace this with your actual SERVICE_ROLE_KEY from Supabase Dashboard
// Get it from: Settings > API > service_role key (NOT anon key!)
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprb2FibHd4b3NuaWhobXVpbG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1MjAyNSwiZXhwIjoyMDc4OTI4MDI1fQ.X2l2UT-SNhy1uzBNtkDjQ2vvabV3hgV6VtWe04N-B78";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === "YOUR_SERVICE_ROLE_KEY_HERE") {
  console.error('❌ Error: Missing SERVICE_ROLE_KEY');
  console.error('\n📋 How to get SERVICE_ROLE_KEY:');
  console.error('   1. Go to Supabase Dashboard: https://supabase.com/dashboard');
  console.error('   2. Select your project');
  console.error('   3. Go to Settings > API');
  console.error('   4. Scroll to "Project API keys" section');
  console.error('   5. Find "service_role" key (NOT "anon" or "public")');
  console.error('   6. Click "Reveal" and copy the key');
  console.error('\n💡 Then set it as environment variable:');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('   npm run create-dummy-users');
  console.error('\n   OR update the script directly (line 19)');
  process.exit(1);
}

// Decode JWT to check the role
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Check if using service role key (not anon key)
const decoded = decodeJWT(SUPABASE_SERVICE_ROLE_KEY);
if (decoded && decoded.role !== 'service_role') {
  console.error('❌ ERROR: You are using the WRONG key!');
  console.error(`   Current key role: ${decoded.role}`);
  console.error('   Required: service_role');
  console.error('\n📋 How to get SERVICE_ROLE_KEY:');
  console.error('   1. Go to Supabase Dashboard');
  console.error('   2. Click on your project');
  console.error('   3. Go to Settings > API');
  console.error('   4. Scroll down to "Project API keys"');
  console.error('   5. Find the key labeled "service_role" (NOT "anon" or "public")');
  console.error('   6. Click "Reveal" and copy the key');
  console.error('\n⚠️  IMPORTANT:');
  console.error('   - service_role key has FULL database access');
  console.error('   - Never commit it to git');
  console.error('   - Only use for admin operations\n');
  process.exit(1);
}

// Create Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Dummy users data
const dummyUsers = [
  {
    email: 'admin@example.com',
    password: 'password123',
    nama_lengkap: 'Admin User',
    role: 'Admin',
    department: 'Management'
  },
  {
    email: 'gm@example.com',
    password: 'password123',
    nama_lengkap: 'General Manager',
    role: 'GM',
    department: 'Management'
  },
  {
    email: 'pm@example.com',
    password: 'password123',
    nama_lengkap: 'Project Manager',
    role: 'GM',
    department: 'Management'
  },
  {
    email: 'sales1@example.com',
    password: 'password123',
    nama_lengkap: 'Sales Person 1',
    role: 'Sales',
    department: 'Sales'
  },
  {
    email: 'sales2@example.com',
    password: 'password123',
    nama_lengkap: 'Sales Person 2',
    role: 'Sales',
    department: 'Sales'
  },
  {
    email: 'presales@example.com',
    password: 'password123',
    nama_lengkap: 'Presales Engineer',
    role: 'Presales',
    department: 'Technical'
  },
  {
    email: 'engineer@example.com',
    password: 'password123',
    nama_lengkap: 'Software Engineer',
    role: 'Engineer',
    department: 'Technical'
  },
  {
    email: 'dev1@example.com',
    password: 'password123',
    nama_lengkap: 'Developer 1',
    role: 'Engineer',
    department: 'Development'
  },
  {
    email: 'dev2@example.com',
    password: 'password123',
    nama_lengkap: 'Developer 2',
    role: 'Engineer',
    department: 'Development'
  },
  {
    email: 'qa@example.com',
    password: 'password123',
    nama_lengkap: 'QA Tester',
    role: 'Engineer',
    department: 'Quality Assurance'
  }
];

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to create user with retry
async function createUserWithRetry(supabaseAdmin, userData, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          nama_lengkap: userData.nama_lengkap,
          role: userData.role
        }
      });

      if (authError) {
        // If it's a rate limit or "not allowed" error, wait and retry
        if ((authError.message.includes('not allowed') || authError.message.includes('rate limit')) && i < retries - 1) {
          const waitTime = (i + 1) * 2000; // Exponential backoff: 2s, 4s, 6s
          console.log(`   ⏳ Rate limited or not allowed, waiting ${waitTime/1000}s before retry...`);
          await delay(waitTime);
          continue;
        }
        return { error: authError };
      }

      return { data: authUser };
    } catch (error) {
      if (i < retries - 1) {
        const waitTime = (i + 1) * 2000;
        console.log(`   ⏳ Error occurred, waiting ${waitTime/1000}s before retry...`);
        await delay(waitTime);
        continue;
      }
      return { error: { message: error.message } };
    }
  }
  return { error: { message: 'Max retries reached' } };
}

async function createDummyUsers() {
  console.log('🚀 Starting to create dummy users...\n');

  const createdUsers = [];
  let gmUserId = null;

  for (let i = 0; i < dummyUsers.length; i++) {
    const userData = dummyUsers[i];
    try {
      // Check if user already exists in public.users
      const { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('email', userData.email)
        .single();

      if (existingProfile) {
        console.log(`⏭️  User ${userData.email} already exists in database, skipping...`);
        if (userData.role === 'GM' && !gmUserId) {
          gmUserId = existingProfile.id;
        }
        createdUsers.push(existingProfile);
        continue;
      }

      // Check if auth user already exists (but profile doesn't)
      let authUserId = null;
      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = authUsers.find(u => u.email === userData.email);
      
      if (existingAuthUser) {
        console.log(`📝 Auth user ${userData.email} already exists, creating profile only...`);
        authUserId = existingAuthUser.id;
      }

      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await delay(1000); // Wait 1 second between requests
      }

      // Create auth user if it doesn't exist
      if (!authUserId) {
        console.log(`📝 Creating auth user: ${userData.email}...`);
        const { data: authUser, error: authError } = await createUserWithRetry(supabaseAdmin, userData);

        if (authError) {
          console.error(`❌ Error creating auth user ${userData.email}:`, authError.message);
          if (authError.message.includes('not allowed')) {
            console.error(`   💡 Tip: Make sure you're using SERVICE_ROLE_KEY, not ANON_KEY`);
            console.error(`   💡 Tip: Check Supabase Auth settings for email restrictions`);
          }
          continue;
        }

        authUserId = authUser.user.id;
        console.log(`✅ Auth user created: ${authUserId}`);
      }

      // Store GM ID for Sales users
      if (userData.role === 'GM' && !gmUserId) {
        gmUserId = authUserId;
      }

      // Wait a bit for trigger to complete (if auth user was just created)
      if (!existingAuthUser) {
        await delay(500);
      }

      // Check if profile exists (might have been created by trigger)
      const { data: checkProfile } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('id', authUserId)
        .single();

      // Prepare profile data
      const profileData = {
        nama_lengkap: userData.nama_lengkap,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        gm_id: userData.role === 'Sales' ? gmUserId : null,
        status_aktif: true
      };

      if (checkProfile) {
        // Profile already exists (created by trigger), update it with full data
        console.log(`📝 Profile for ${userData.email} exists (created by trigger), updating...`);
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update(profileData)
          .eq('id', authUserId);

        if (updateError) {
          console.error(`❌ Error updating profile for ${userData.email}:`, updateError.message);
        } else {
          console.log(`✅ Profile updated for ${userData.email}`);
        }
        createdUsers.push({ id: authUserId, email: userData.email });
      } else {
        // Profile doesn't exist, create it
        const insertData = {
          id: authUserId,
          ...profileData
        };

        const { error: profileError } = await supabaseAdmin
          .from('users')
          .insert([insertData]);

        if (profileError) {
          // If duplicate key error, profile might have been created by trigger after our check
          if (profileError.message.includes('duplicate key') || profileError.code === '23505') {
            console.log(`⚠️  Profile for ${userData.email} was created by trigger, updating...`);
            // Try to update instead
            const { error: updateError } = await supabaseAdmin
              .from('users')
              .update(profileData)
              .eq('id', authUserId);
            
            if (updateError) {
              console.error(`❌ Error updating profile:`, updateError.message);
            } else {
              console.log(`✅ Profile updated for ${userData.email}`);
            }
            createdUsers.push({ id: authUserId, email: userData.email });
          } else {
            console.error(`❌ Error creating profile for ${userData.email}:`, profileError.message);
            // Only delete auth user if we created it in this run and profile creation failed
            if (!existingAuthUser) {
              console.log(`   🗑️  Cleaning up auth user...`);
              await supabaseAdmin.auth.admin.deleteUser(authUserId);
            }
          }
        } else {
          console.log(`✅ Profile created for ${userData.email}`);
          createdUsers.push({ id: authUserId, email: userData.email });
        }
      }

      // Small delay after successful creation
      await delay(500);

    } catch (error) {
      console.error(`❌ Unexpected error for ${userData.email}:`, error.message);
    }
  }

  // Update Sales users with GM ID if needed
  if (gmUserId) {
    console.log('\n📝 Updating Sales users with GM ID...');
    for (const userData of dummyUsers) {
      if (userData.role === 'Sales') {
        const { data: salesUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', userData.email)
          .single();

        if (salesUser) {
          await supabaseAdmin
            .from('users')
            .update({ gm_id: gmUserId })
            .eq('id', salesUser.id);
          console.log(`✅ Updated ${userData.email} with GM ID`);
        }
      }
    }
  }

  console.log('\n✨ Dummy users creation completed!\n');
  console.log('📋 Created users:');
  createdUsers.forEach(user => {
    console.log(`   - ${user.email} (${user.id})`);
  });

  console.log('\n🔑 Login credentials:');
  console.log('   Email: [any user email above]');
  console.log('   Password: password123\n');

  return createdUsers;
}

// Run the script
createDummyUsers()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

