import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TracePanelProps {
  title: string;
  children: React.ReactNode;
}

export function TracePanel({ title, children }: TracePanelProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="font-mono font-bold text-secondary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="">{children}</CardContent>
    </Card>
  );
}
