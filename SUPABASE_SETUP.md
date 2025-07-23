# Supabase Setup Guide for WebEDI Visual Workflow

This guide will help you set up Supabase to add persistent storage and customer profiles to your WebEDI Visual Workflow application.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Your Supabase project URL and anon key

## Step 1: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```bash
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

You can find these values in your Supabase dashboard under Settings > API.

## Step 2: Create Database Tables

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `src/database/schema.sql` into the editor
4. Click "Run" to create all the necessary tables and views

The schema includes:
- **companies** - Stores customer and trading partner information
- **trading_partners** - Dedicated trading partner details
- **tickets** - Complete ticket history with workflow data
- **customer_profiles** - A view that aggregates customer statistics

## Step 3: Verify Setup

1. Restart your development server:
   ```bash
   npm start
   ```

2. You should now see:
   - A customer search bar in the header
   - Recent tickets display below the ticket input
   - Tickets are automatically saved when workflows are generated

## Features Now Available

### 1. Customer Search
- Type at least 2 characters in the search bar to find customers
- Click on a customer to view their profile

### 2. Customer Profiles
- View complete ticket history for each customer
- See statistics like total tickets, resolution rate, and common errors
- Click on any past ticket to reload it

### 3. Automatic Ticket Storage
- Every ticket is automatically saved when you generate a workflow
- Stores the complete visual workflow data
- Tracks companies and trading partners

### 4. Recent Tickets
- Shows the 5 most recent tickets below the input area
- Click any ticket to reload and view its workflow

## Usage Tips

1. **First Time Use**: The first tickets you process will create new company records automatically

2. **Customer Lookup**: Use the search bar to quickly find repeat customers and see their history

3. **Ticket History**: All tickets are preserved with their visual workflows, making it easy to reference past issues

4. **Resolution Tracking**: You can update ticket status and add resolution notes (this feature can be enhanced further)

## Troubleshooting

If features aren't working:

1. **Check Console**: Open browser developer tools and check for any errors
2. **Verify Credentials**: Ensure your Supabase URL and anon key are correct
3. **Database Tables**: Verify all tables were created successfully in Supabase
4. **Network**: Ensure you have internet connectivity for Supabase API calls

## Next Steps

Consider adding:
- User authentication for multi-user support
- Advanced search filters (by date, status, error type)
- Export functionality for customer reports
- Email notifications for recurring issues
- Analytics dashboard for trends

## Security Note

The current setup uses the anon key which is safe for client-side usage. For production, consider:
- Implementing Row Level Security (RLS) policies
- Adding user authentication
- Using service role key only on backend