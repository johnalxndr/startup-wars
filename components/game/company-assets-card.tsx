import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Briefcase } from "lucide-react";
import { GameState } from "@/app/types";

interface CompanyAssetsCardProps {
  gameState: GameState;
}

export function CompanyAssetsCard({ gameState }: CompanyAssetsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Company Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Engineers:</span>
            <span className="font-medium">{gameState.assets.engineers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Designers:</span>
            <span className="font-medium">{gameState.assets.designers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Marketers:</span>
            <span className="font-medium">{gameState.assets.marketers}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm">Servers:</span>
            <span className="font-medium">{gameState.assets.servers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Patents:</span>
            <span className="font-medium">{gameState.assets.patents}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}