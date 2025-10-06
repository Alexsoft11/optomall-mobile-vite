import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BucketChecker({ bucket, label }: { bucket: string; label: string }) {
  const [exists, setExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    if (!supabase) {
      setError("Supabase not configured");
      setExists(null);
      return;
    }
    setChecking(true);
    setError(null);
    try {
      // Try to list a small set of files to detect bucket existence/permissions
      const { data, error } = await supabase.storage.from(bucket).list("", { limit: 1 });
      if (error) {
        // If error.message mentions "not found" or status indicates missing bucket
        setExists(false);
        setError(error.message || String(error));
      } else {
        setExists(true);
      }
    } catch (err: any) {
      setExists(false);
      setError(err.message || String(err));
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  return (
    <div className="mb-4 p-3 bg-white rounded shadow-sm flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">Bucket: {label} <span className="text-xs text-slate-500">({bucket})</span></div>
        <div className="text-xs mt-1">
          {checking ? (
            <span>Checking...</span>
          ) : exists === null ? (
            <span className="text-slate-500">Unknown</span>
          ) : exists ? (
            <span className="text-green-600">Bucket exists and is accessible</span>
          ) : (
            <span className="text-red-600">Bucket not found or inaccessible</span>
          )}
        </div>
        {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={check} className="px-3 py-1 bg-slate-100 rounded text-sm">Re-check</button>
        <details className="text-sm">
          <summary className="cursor-pointer px-3 py-1 bg-blue-600 text-white rounded">How to create</summary>
          <div className="mt-2 p-2 text-xs bg-slate-50 rounded">
            <ol className="list-decimal ml-4">
              <li>Open your Supabase project dashboard.</li>
              <li>Go to Storage → Buckets → Create new bucket.</li>
              <li>Enter bucket name: <code>{bucket}</code> and set Public (or configure appropriate RLS/Policies).</li>
              <li>Click Create. Then upload a test file to verify access.</li>
              <li>For public access, check the file URL via <code>Get public URL</code>.</li>
            </ol>
            <div className="mt-2">If you cannot create buckets from the UI, you need a service_role key or organization permissions.</div>
          </div>
        </details>
      </div>
    </div>
  );
}
