"use client";

import { useEffect, useState } from "react";
import AudioScreen from "@/components/Authentication/AudioScreen";

export default function Page() {
  const [shareId, setShareId] = useState(null);

  useEffect(() => {
    // Retrieve shareId from localStorage
    const id = localStorage.getItem("shareId");
    if (id) {
      setShareId(id);
    } else {
      // Handle the case where shareId is missing (e.g., redirect or show error)
      console.error("No shareId found in localStorage.");
    }
  }, []);

  // Render the AudioScreen component only if shareId is available
  return shareId ? <AudioScreen shareId={shareId} /> : <div>Loading...</div>;
}
