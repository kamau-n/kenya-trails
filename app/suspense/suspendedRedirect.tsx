// SuspendedRedirect.tsx
"use client";

import { useSearchParams } from "next/navigation";

export function SuspendedRedirect({
  onFound,
}: {
  onFound: (redirect: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  onFound(redirect);

  return null;
}
