import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TeamMemberAttributes } from '@/app/types';

interface AttributeAllocatorProps {
  onSubmitAttributes: (attributes: TeamMemberAttributes) => void;
  totalPoints: number;
}

const attributeKeys: (keyof TeamMemberAttributes)[] = [
  'coding',
  'design',
  'marketing',
];

const attributeLabels: Record<keyof TeamMemberAttributes, string> = {
  coding: "Coding",
  design: "Design",
  marketing: "Marketing",
};

export const AttributeAllocator: React.FC<AttributeAllocatorProps> = ({ onSubmitAttributes, totalPoints }) => {
  const initialAttributeValue = Math.floor(totalPoints / attributeKeys.length);
  const remainder = totalPoints % attributeKeys.length;

  const [attributes, setAttributes] = useState<TeamMemberAttributes>(() => {
    const initialAttrs: Partial<TeamMemberAttributes> = {};
    attributeKeys.forEach((key, index) => {
      initialAttrs[key] = initialAttributeValue + (index < remainder ? 1 : 0);
    });
    return initialAttrs as TeamMemberAttributes; // Should be fully populated
  });

  const pointsUsed = useMemo(() => {
    return attributeKeys.reduce((sum, key) => sum + (attributes[key] ?? 0), 0);
  }, [attributes]);

  const pointsRemaining = totalPoints - pointsUsed;

  const handleSliderChange = (key: keyof TeamMemberAttributes, value: number) => {
    const currentVal = attributes[key] ?? 0;
    const diff = value - currentVal;

    if (pointsRemaining - diff >= 0) {
      setAttributes(prev => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleSubmit = () => {
    if (pointsRemaining === 0) {
      onSubmitAttributes(attributes);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-10">
      <Card className="w-[500px]">
        <CardHeader className="text-center">
          <CardTitle>Allocate Founder Attributes</CardTitle>
          <CardDescription>
            Distribute your starting points across key skills. Total Points: {totalPoints}
          </CardDescription>
          <p className={`mt-2 font-semibold ${pointsRemaining === 0 ? 'text-green-600' : 'text-red-600'}`}>
            Points Remaining: {pointsRemaining}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {attributeKeys.map((key) => (
            <div key={key} className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor={key} className="capitalize">{attributeLabels[key]}</Label>
                <span className="font-medium">{attributes[key]}</span>
              </div>
              <Slider
                id={key}
                min={1}
                max={10} // Or adjust max based on desired scale
                step={1}
                value={[attributes[key] ?? 1]}
                onValueChange={(value: number[]) => handleSliderChange(key, value[0])}
                disabled={pointsRemaining === 0 && (attributes[key] ?? 0) <= 1}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSubmit} disabled={pointsRemaining !== 0}>
            Start Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 