"use client";

import { useEffect } from "react";
import { incrementAnalytics } from "@/lib/actions";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VehicleViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    // Increment view once per mount
    incrementAnalytics(listingId, "views").catch(console.error);
  }, [listingId]);

  return null;
}

export function VehicleContactButtons({ 
  listingId, 
  whatsappLabel, 
  callLabel 
}: { 
  listingId: string;
  whatsappLabel: string;
  callLabel: string;
}) {
  const handleChat = async () => {
    await incrementAnalytics(listingId, "chats").catch(console.error);
    alert("This is a demo. Chat would open here.");
  };

  const handleCall = async () => {
    await incrementAnalytics(listingId, "phoneClicks").catch(console.error);
    alert("This is a demo. Phone number would be revealed here.");
  };

  return (
    <div className="pt-4 grid gap-3">
      <Button onClick={handleChat} size="lg" className="w-full flex items-center justify-center gap-2 text-lg">
        <MessageCircle className="w-5 h-5" />
        {whatsappLabel}
      </Button>
      <Button onClick={handleCall} size="lg" variant="outline" className="w-full flex items-center justify-center gap-2 text-lg">
        <Phone className="w-5 h-5" />
        {callLabel}
      </Button>
    </div>
  );
}
