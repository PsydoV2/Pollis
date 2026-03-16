"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import HomeView from "@/components/Homeview";
import PollView from "@/components/Pollview";

function HomeInner() {
  const searchParams = useSearchParams();
  const poll = searchParams.get("poll");
  return poll ? <PollView id={poll} /> : <HomeView />;
}

export default function HomeClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <HomeInner />
    </Suspense>
  );
}
