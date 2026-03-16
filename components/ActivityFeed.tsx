"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Activity } from "@/lib/types";

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const q = query(collection(db, "activity"), orderBy("createdAt", "desc"), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Activity[] = snapshot.docs.map((doc) => doc.data() as Activity);
      setActivities(items);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Feed</h2>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={activity.activityId || index}
            className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border-l-4 border-primary"
          >
            {activity.message}
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">No activity yet</div>
        )}
      </div>
    </div>
  );
}
