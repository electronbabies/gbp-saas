# Send Email Edge Function

This Edge Function handles email sending using SMTP in Supabase.

## Environment Variables Required

```bash
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=your-from-email
```

## Deployment

1. Install Supabase CLI if not already installed
2. Login to Supabase: `supabase login`
3. Deploy the function: `supabase functions deploy send-email`
4. Set environment variables:
   ```bash
   supabase secrets set SMTP_HOST=your-smtp-host
   supabase secrets set SMTP_PORT=587
   supabase secrets set SMTP_USER=your-smtp-username
   supabase secrets set SMTP_PASS=your-smtp-password
   supabase secrets set SMTP_FROM=your-from-email
   ```