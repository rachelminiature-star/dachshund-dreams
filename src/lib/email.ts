// Browser-side email relay (Web3Forms). The free plan only accepts
// client-side submissions, so this must run in the browser, not on the server.
// Access keys are publishable by design.
const WEB3FORMS_ACCESS_KEY = "b3da3eca-66b7-45f0-b9d1-1be7e78d3b30";

export async function forwardEmail({
  data,
}: {
  data: { payload: Record<string, string> };
}): Promise<{ ok: boolean; error: string | null }> {
  const { _subject, ...rest } = data.payload;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: _subject || "New website submission",
        from_name: "Rachel Miniature Dachshunds",
        ...rest,
      }),
    });
    const json = (await res.json().catch(() => null)) as
      | { success?: boolean; message?: string }
      | null;
    if (!res.ok || !json?.success) {
      return { ok: false, error: json?.message ?? `Email relay returned ${res.status}` };
    }
    return { ok: true, error: null };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Email relay unreachable" };
  }
}
