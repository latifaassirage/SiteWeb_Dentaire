-- Fix existing invoice statuses from 'en_attente_paiement' to 'unpaid'
UPDATE invoices SET status = 'unpaid' WHERE status = 'en_attente_paiement';

-- Verify the update
SELECT status, COUNT(*) as count FROM invoices GROUP BY status;
